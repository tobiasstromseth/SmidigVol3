import subprocess
import concurrent.futures


memory_file_path = r'F:\skole\vol3guio\memoryDumpsChallenge.raw' #####Only for testing. Github takler ikke filer på over 100mb så peker på full filsti her. endre etter eget behov
vol_file_path = r'code\Volatility3\vol.py'


# Function to identify the operating system using imageinfo
def identify_os():
    global memory_file_path, detected_os
    
    # Check if memory_file_path and vol_file_path are set
    if not memory_file_path or not vol_file_path:
        print("Warning", "Please select a memory file first and ensure vol.py is found.")
        return
    
    # Dictionary mapping operating system names to their respective pslist commands
    os_commands = {
        "Windows": "windows.pslist.PsList",
        "Linux": "linux.pslist.PsList", 
        "Mac": "mac.pslist.PsList"
    }
    
    detected_os = None
    
    # Use ThreadPoolExecutor to run the commands in parallel
    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Submit the commands to the executor
        futures = {executor.submit(run_command, os_name, os_command): os_name for os_name, os_command in os_commands.items()}
        
        # Check the results as they complete
        for future in concurrent.futures.as_completed(futures):
            os_name = futures[future]
            try:
                output = future.result()
                # Check if the output contains "PID" indicating a successful command
                if "PID" in output:
                    detected_os = os_name
                    print(f"OS Detected: {detected_os}")
                    detected_os = detected_os.lower()
                    break  # Break the loop if an operating system is successfully detected
            except Exception as e:
                continue  # Continue to the next future if an exception occurs
                
    # If no operating system is detected, print "Unknown"            
    if not detected_os:
        print("OS Detected: Unknown") 
        print("Info", "Unable to determine the operating system.")

# Helper function to run a command and return the output
def run_command(os_name, os_command):
    # Construct the full command to run vol.py with the selected memory file and OS-specific command
    full_command = f'python {vol_file_path} -f \"{memory_file_path}\" {os_command}'
    # Run the command as a subprocess and capture the output
    process = subprocess.Popen(full_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    output, _ = process.communicate()
    return output


identify_os()