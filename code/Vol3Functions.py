import subprocess
import concurrent.futures
import os
import json


memory_file_path = r'F:\skole\vol3guio\memoryDumps\Challenge.raw' #####Only for testing. Github takler ikke filer på over 100mb så peker på full filsti her. endre etter eget behov
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
        futures = {executor.submit(run_command, os_command): os_name for os_name, os_command in os_commands.items()}
        
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
def run_command(command):
    # Construct the full command to run vol.py with the selected memory file and OS-specific command
    full_command = f'python {vol_file_path} -f \"{memory_file_path}\" {command}'
    print(f'Full command in run_command: {full_command}')
    # Run the command as a subprocess and capture the output
    process = subprocess.Popen(full_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    output, error = process.communicate()
    if error:
            print("Error", f"Error running command: {error}")
    else:
        return output


# Function to save the output to a JSON file
def save_output_to_json(raw_output, filename):
    print(filename)
    # Split the raw output into lines
    lines = raw_output.strip().split('\n')

    # Ignore lines until we reach one containing 'PID' to find the start of useful data
    start_index = next((i for i, line in enumerate(lines) if "PID" in line), None)
    if start_index is not None:
        # Extract the headers from the line containing 'PID'
        headers = lines[start_index].split()
        data = []

        # Iterate over the lines after the headers
        for line in lines[start_index + 1:]:
            if line.strip():  # Check if the line is not empty
                # Split the line into columns based on the number of headers
                columns = line.split(maxsplit=len(headers)-1)
                if len(columns) == len(headers):
                    # Create a dictionary mapping headers to column values
                    row_data = dict(zip(headers, columns))
                    data.append(row_data)

        # Create the directory if it doesn't exist
        directory = os.path.dirname(filename)
        if not os.path.exists(directory):
            os.makedirs(directory)

        # Save the data to a JSON file
        with open(f"{filename}.json", 'w') as f:
            json.dump(data, f, indent=4)
            print("json dumped")
        #print(data)


# Function to run a Volatility command
def run_volatility_command(command):

    json_directory = r"code\pluginOutput"
    # Create the JSON directory if it doesn't exist
    if not os.path.exists(json_directory):
        os.makedirs(json_directory)
    global memory_file_path
    # Check if memory_file_path and vol_file_path are set
    if not memory_file_path or not vol_file_path:
        print("Warning", "Please select a memory file and ensure vol.py is found.")
        return
    
    print(f"Running command: {command}")  # Debug print
    # Change the current directory to the directory containing vol.py
    print(f"Changed directory to: {os.getcwd()}")  # Debug print
    # Construct the full command to run vol.py with the selected memory file and OS-specific command
    full_command = f'{detected_os}.{command}'
    print(f"Full command: {full_command}")  # Debug print
    # Run the command as a subprocess and capture the output and error
    output = run_command(full_command)
    print(output)

    clean_memory_file_path = memory_file_path.replace(':', '_').replace('\\', '-') 
    file_name = f'{json_directory}\command{full_command}file{clean_memory_file_path}'
    save_output_to_json(output, file_name)


def get_file_info(directory):
    file_info = []
    
    # Iterate over files in the directory
    for filename in os.listdir(directory):
        # Skip directories, only process files
        if os.path.isfile(os.path.join(directory, filename)):
            # Extract the command and file path from the filename
            command, file_path = filename.split('file', 1)
            command = command.replace('command', '')
            file_path = file_path.replace('_', ':').replace('-', '\\')
            
            # Append the command and file path as a tuple to the list
            file_info.append((command, file_path))
    
    return file_info


volatility_commands = [
    ("pslist", "pslist.PsList"), 
    ("psscan", "psscan.PsScan"), 
    ("pstree", "pstree.PsTree"),
    ("info", "info"),
]


identify_os()
run_volatility_command('pslist.PsList')

json_directory = r"code\pluginOutput"
file_info_list = get_file_info(json_directory)

# Print the file information
for command, file_path in file_info_list:
    print(f"Command: {command}")
    print(f"File Path: {file_path}")
    print()