import unittest
import os
import json
from unittest.mock import patch, MagicMock, call
import tempfile
import hashlib
import js2py

from Vol3Functions import *
import Vol3Functions
from app import Api

class TestVolatilityFunctions(unittest.TestCase):
    def setUp(self):
        # Set up any necessary test data or mocks
        pass

    def tearDown(self):
        # Clean up any test data or mocks
        pass

    def test_calculate_file_hash(self):
        # Create a temporary file for testing
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            try:
                # Write some content to the temporary file
                content = b"Hello, World!"
                temp_file.write(content)
                temp_file.flush()

                # Call the calculate_file_hash function with the temporary file path
                calculated_hash = Vol3Functions.calculate_file_hash(temp_file.name)

                # Assert that the calculated hash matches the expected hash
                expected_hash = hashlib.sha256(content).hexdigest()
                self.assertEqual(calculated_hash, expected_hash)
            finally:
                # Close the temporary file before unlinking it
                temp_file.close()
                
                # Clean up the temporary file
                os.unlink(temp_file.name)



    def test_identify_os(self):
        # Set up the test file path
        test_file_path = r"F:\skole\vol3guio\memoryDumps\Challenge.raw"

        # Set up the expected detected OS
        expected_os = "windows"

        # Define the expected outputs for each command
        command_outputs = {
            "windows.pslist.PsList": "PID   PPID   ImageFileName   Offset(V)   Threads   Handles   SessionId   Wow64   CreateTime   ExitTime   FileVersion\n",
            "linux.pslist.PsList": "Error: Volatility command failed",
            "mac.pslist.PsList": "Error: Volatility command failed"
        }

        # Patch the run_command function to return the expected output based on the command
        with patch("Vol3Functions.run_command", side_effect=lambda x: command_outputs[x]) as mock_run_command:
            # Call the identify_os function with the test file path
            detected_os = identify_os(test_file_path)

            # Assert that the detected OS matches the expected OS
            self.assertEqual(detected_os, expected_os)

            # Assert that the run_command function was called with the correct commands
            expected_commands = ["windows.pslist.PsList", "linux.pslist.PsList", "mac.pslist.PsList"]
            mock_run_command.assert_has_calls([call(cmd) for cmd in expected_commands], any_order=True)


    def test_run_command(self):
        # Set up the test file path
        test_file_path = r"F:\skole\vol3guio\memoryDumps\Challenge.raw"

        # Set the memory_file_path and vol_file_path variables
        global memory_file_path, vol_file_path
        memory_file_path = test_file_path
        vol_file_path = r'code\Volatility3\vol.py'

        # Set up the expected command and output
        expected_command = "windows.pslist.PsList"
        expected_output = "PID   PPID   ImageFileName   Offset(V)   Threads   Handles   SessionId   Wow64   CreateTime   ExitTime   FileVersion\n"

        # Patch the subprocess.Popen function to return a mock process object
        with patch("subprocess.Popen") as mock_popen:
            # Create a mock process object
            mock_process = MagicMock()
            mock_process.communicate.return_value = (expected_output, None)
            mock_popen.return_value = mock_process

            # Call the run_command function with the test command
            output = run_command(expected_command)

            # Assert that the run_command function returns the expected output
            self.assertEqual(output, expected_output)

            # Assert that subprocess.Popen was called with the correct command
            expected_full_command = f'python {vol_file_path} -f "{memory_file_path}" {expected_command}'
            mock_popen.assert_called_once_with(expected_full_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)



    def test_run_command_from_gui(self):
        # Set up the test file path
        test_file_path = r"F:\skole\vol3guio\memoryDumps\Challenge.raw"

        # Set the memory_file_path and vol_file_path variables
        global memory_file_path, vol_file_path
        memory_file_path = test_file_path
        vol_file_path = r'code\Volatility3\vol.py'

        # Set up the test plugin name and expected command
        test_plugin_name = "pslist"
        expected_command = "pslist.PsList"

        # Create a sample JSON data for the test
        sample_json_data = [
            {
                "category": "Processes",
                "plugins": [
                    {
                        "name": "pslist",
                        "command": "pslist.PsList"
                    },
                    {
                        "name": "Another plugin",
                        "command": "another.Plugin"
                    }
                ]
            }
        ]

        # Write the sample JSON data to a temporary file
        with open('code\mockDatabaseTest.json', 'w') as file:
            json.dump(sample_json_data, file)

        # Patch the run_volatility_command function to return a mock output
        with patch("Vol3Functions.run_volatility_command") as mock_run_volatility_command:
            mock_output = "Mock output from run_volatility_command"
            mock_run_volatility_command.return_value = mock_output

            # Call the run_command_from_gui function with the test plugin name
            output = run_command_from_gui(test_plugin_name)

            # Assert that the run_command_from_gui function returns the expected output
            self.assertEqual(output, mock_output)

            # Assert that run_volatility_command was called with the correct command
            mock_run_volatility_command.assert_called_once_with(expected_command)

        # Clean up the temporary JSON file
        os.remove('code\mockDatabaseTest.json')


    def test_save_output_to_json(self):
        # Set up the test data
        raw_output = """
    PID   PPID   ImageFileName   Offset(V)   Threads   Handles   SessionId   Wow64   CreateTime   ExitTime   FileVersion
    1     0      System          0xfa8000000 85        1031     N/A         False   N/A          N/A        N/A
    2     0      smss.exe        0xfa80009c0 2         29       N/A         False   N/A          N/A        N/A
    3     2      csrss.exe       0xfa8001120 10        436      0           False   N/A          N/A        N/A
    4     2      wininit.exe     0xfa8001900 3         75       0           False   N/A          N/A        N/A
        """
        filename = "test_output"

        # Create a temporary directory for the test output
        with tempfile.TemporaryDirectory() as temp_dir:
            # Call the save_output_to_json function with the test data
            json_data = save_output_to_json(raw_output, os.path.join(temp_dir, filename))

            # Assert that the JSON data is not None
            self.assertIsNotNone(json_data)

            # Load the saved JSON file
            with open(os.path.join(temp_dir, f"{filename}.json"), 'r', encoding='utf-8') as f:
                saved_data = json.load(f)

            # Assert that the saved data matches the expected structure
            expected_data = [
                {
                    "PID": "1",
                    "PPID": "0",
                    "ImageFileName": "System",
                    "Offset(V)": "0xfa8000000",
                    "Threads": "85",
                    "Handles": "1031",
                    "SessionId": "N/A",
                    "Wow64": "False",
                    "CreateTime": "N/A",
                    "ExitTime": "N/A",
                    "FileVersion": "N/A"
                },
                {
                    "PID": "2",
                    "PPID": "0",
                    "ImageFileName": "smss.exe",
                    "Offset(V)": "0xfa80009c0",
                    "Threads": "2",
                    "Handles": "29",
                    "SessionId": "N/A",
                    "Wow64": "False",
                    "CreateTime": "N/A",
                    "ExitTime": "N/A",
                    "FileVersion": "N/A"
                },
                {
                    "PID": "3",
                    "PPID": "2",
                    "ImageFileName": "csrss.exe",
                    "Offset(V)": "0xfa8001120",
                    "Threads": "10",
                    "Handles": "436",
                    "SessionId": "0",
                    "Wow64": "False",
                    "CreateTime": "N/A",
                    "ExitTime": "N/A",
                    "FileVersion": "N/A"
                },
                {
                    "PID": "4",
                    "PPID": "2",
                    "ImageFileName": "wininit.exe",
                    "Offset(V)": "0xfa8001900",
                    "Threads": "3",
                    "Handles": "75",
                    "SessionId": "0",
                    "Wow64": "False",
                    "CreateTime": "N/A",
                    "ExitTime": "N/A",
                    "FileVersion": "N/A"
                }
            ]
            self.assertEqual(saved_data, expected_data)


    def test_run_volatility_command(self):
        # Set up the test file path
        test_file_path = r"F:\skole\vol3guio\memoryDumps\Challenge.raw"

        # Set the memory_file_path and vol_file_path variables
        global memory_file_path, vol_file_path, detected_os, file_hash
        memory_file_path = test_file_path
        vol_file_path = r'code\Volatility3\vol.py'
        detected_os = "windows"
        file_hash = "80366d7ec64a5529c95c2f523f4281a5f11efbad33ecb19f73525470c1407b23"

        # Set up the test command and expected output
        test_command = "pslist.PsList"
        expected_output = '"Mock output from run_command"'

        # Patch the get_file_info function to return an empty list
        with patch("Vol3Functions.get_file_info", return_value=[]):
            # Patch the run_command function to return the expected output
            with patch("Vol3Functions.run_command", return_value="Mock output from run_command") as mock_run_command:
                # Patch the save_output_to_json function to return the expected output
                with patch("Vol3Functions.save_output_to_json", return_value="Mock output from run_command") as mock_save_output_to_json:
                    # Call the run_volatility_command function with the test command
                    output = run_volatility_command(test_command)

                    # Assert that the output matches the expected output
                    self.assertEqual(output, expected_output)

                    # Assert that the run_command function was called with the correct command
                    expected_full_command = f"{detected_os}.{test_command}"
                    mock_run_command.assert_called_once_with(expected_full_command)

                    # Assert that the save_output_to_json function was called with the correct arguments
                    expected_file_name = f"code\\pluginOutput\\command{expected_full_command}file{file_hash}"
                    mock_save_output_to_json.assert_called_once_with("Mock output from run_command", expected_file_name)





    def test_get_file_info(self):
        # Create a temporary directory for the test files
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create sample files in the temporary directory
            file1 = os.path.join(temp_dir, "commandwindows.modules.ModulesListfilefile2_hash.json")
            file2 = os.path.join(temp_dir, "commandwindows.pslist.PSlistfilefile1_hash.json")
            open(file1, 'w').close()
            open(file2, 'w').close()

            try:
                # Call the get_file_info function with the temporary directory
                file_info = get_file_info(temp_dir)

                # Assert that the file_info list contains the expected tuples
                expected_file_info = [
                    ("windows.modules.ModulesList", "file2:hash.json"),
                    ("windows.pslist.PSlist", "file1:hash.json")
                ]
                
                self.assertEqual(file_info, expected_file_info)
            finally:
                # Clean up the created files
                os.remove(file1)
                os.remove(file2)



class TestApi(unittest.TestCase):
    def setUp(self):
        self.api = Api()

    @patch('tkinter.filedialog.askopenfilename')
    @patch('app.Api.setFilePath')
    def test_openFileDialog(self, mock_setFilePath, mock_askopenfilename):
        mock_askopenfilename.return_value = 'path/to/file'
        mock_setFilePath.return_value = 'detected_os'

        file_path, detected_os = self.api.openFileDialog()

        self.assertEqual(file_path, 'path/to/file')
        self.assertEqual(detected_os, 'detected_os')
        mock_setFilePath.assert_called_once_with('path/to/file')


    @patch('app.identify_os')
    @patch('builtins.print')
    def test_setFilePath(self, mock_print, mock_identify_os):
        mock_identify_os.return_value = 'mocked_os'

        self.api.setFilePath('path/to/file')

        self.assertEqual(self.api.file_path, 'path/to/file')
        mock_print.assert_called_once_with('File path set: path/to/file')
        mock_identify_os.assert_called_once_with('path/to/file')


    @patch('os.path.exists')
    @patch('os.makedirs')
    @patch('os.path.basename')
    @patch('os.rename')
    @patch('builtins.print')
    def test_moveFileToFolder(self, mock_print, mock_rename, mock_basename, mock_makedirs, mock_exists):
        self.api.file_path = 'path/to/file.txt'
        mock_exists.return_value = False
        mock_basename.return_value = 'file.txt'

        self.api.moveFileToFolder()

        mock_exists.assert_called_once_with('code/memDump/')
        mock_makedirs.assert_called_once_with('code/memDump/')
        mock_basename.assert_called_once_with('path/to/file.txt')
        mock_rename.assert_called_once_with('path/to/file.txt', 'code/memDump/file.txt')
        mock_print.assert_called_once_with('File file.txt moved to code/memDump/file.txt')

    @patch('builtins.print')
    @patch('app.run_command_from_gui')
    def test_run_plugin(self, mock_run_command_from_gui, mock_print):
        mock_run_command_from_gui.return_value = 'plugin_output'

        output = self.api.run_plugin('plugin_name')

        self.assertEqual(output, 'plugin_output')
        mock_print.assert_any_call('Running plugin: plugin_name')
        mock_print.assert_any_call('done running plugin')
        mock_run_command_from_gui.assert_called_once_with('plugin_name')

    @patch('builtins.print')
    def test_debug(self, mock_print):
        self.api.debug('test message')

        mock_print.assert_called_once_with('Debug: test message')

    @patch('webview.windows')
    def test_minimize(self, mock_windows):
        self.api.minimize()

        mock_windows.__getitem__.assert_called_once_with(0)
        mock_windows.__getitem__.return_value.minimize.assert_called_once()

    @patch('webview.windows')
    def test_toggle_fullscreen(self, mock_windows):
        self.api.toggle_fullscreen()

        mock_windows.__getitem__.assert_called_once_with(0)
        mock_windows.__getitem__.return_value.toggle_fullscreen.assert_called_once()

    @patch('webview.windows')
    def test_close(self, mock_windows):
        self.api.close()

        mock_windows.__getitem__.assert_called_once_with(0)
        mock_windows.__getitem__.return_value.destroy.assert_called_once()

    @patch('webview.windows')
    def test_resize_window(self, mock_windows):
        self.api.resize_window(800, 600)

        mock_windows.__getitem__.assert_called_once_with(0)
        mock_windows.__getitem__.return_value.resize.assert_called_once_with(800, 600)

    @patch('builtins.print')
    @patch('app.output_queue')
    def test_log(self, mock_output_queue, mock_print):
        value = self.api.log()

        self.assertEqual(value, 'Hello World')
        mock_print.assert_called_once_with('Hello World')
        mock_output_queue.put.assert_called_once_with('Hello World')






if __name__ == '__main__':
    unittest.main()



