var tabCount = 0;

// Variable to keep track of the number of tabs
var tabCount = 0;

// Function to add new tabs
function addTabs() {
    // Get the topbar and "add tab" button elements
    const topbar = document.getElementById('topbar');
    const addTabBtn = document.getElementById('addTab1');
    
    // Update the tab count based on the number of child elements in the topbar
    tabCount = topbar.childElementCount;

    // Create a new tab element
    const newTab = document.createElement('div');
    newTab.className = 'tabs';
    newTab.id = `tab${tabCount}`;
        
    // Create a paragraph element for the tab text
    const tabText = document.createElement('p');
    tabText.textContent = `New Tab ${tabCount}`;
        
    // Create a close button element for the tab
    const closeBtn = document.createElement('div');
    closeBtn.className = 'x';
    closeBtn.id = `x${tabCount}`;
    closeBtn.textContent = 'x';
    closeBtn.setAttribute('onclick', `removeTab(${tabCount})`);
        
    // Append the tab text and close button to the new tab element
    newTab.appendChild(tabText);
    newTab.appendChild(closeBtn);
        
    // Insert the new tab element right before the "add tab" button
    addTabBtn.parentNode.insertBefore(newTab, addTabBtn);

    // Get all the tab elements
    const tabElements = document.querySelectorAll('.tabs');

    // Iterate through the tab elements and set the z-index dynamically
    tabElements.forEach((tab, index) => {
        tab.style.zIndex = tabElements.length - index;
        console.log(tabCount);
        updateAddTabMargin();
    });
}


const categories = [
    {
      name: 'Process Analysis',
      plugins: [
        { name: 'pslist', description: 'Lists the processes present in a memory dump.' },
        { name: 'pstree', description: 'Shows the parent-child relationship between processes in a tree view.' },
        { name: 'psxview', description: 'Helps detect hidden processes by cross-referencing various process listings.' },
        { name: 'psscan', description: 'Scans physical memory for EPROCESS objects.' },
        { name: 'cmdline', description: 'Displays process command-line arguments.' },
        { name: 'getsids', description: 'Print the SIDs owning each process.' },
        { name: 'dlllist', description: 'Lists the loaded DLLs for each process.' },
        { name: 'handles', description: 'Lists the open handles for each process.' }
      ]
    },
    {
      name: 'Network Analysis',
      plugins: [
        { name: 'netscan', description: 'Scans for network artifacts in Windows memory dumps.' },
        { name: 'netstat', description: 'Prints a list of open sockets and network connections.' },
        { name: 'connscan', description: 'Scans for connection objects using pool tag scanning.' },
        { name: 'sockets', description: 'Prints a list of open sockets.' },
        { name: 'sockscan', description: 'Scans for socket objects using pool tag scanning.' },
        { name: 'connections', description: 'Prints a list of open connections.' },
        { name: 'dnsquery', description: 'Prints DNS queries performed by processes.' }
      ]
    },
    {
      name: 'File System Analysis',
      plugins: [
        { name: 'filescan', description: 'Scans for file objects using pool tag scanning.' },
        { name: 'dumpfiles', description: 'Extracts memory mapped and cached files.' },
        { name: 'mftparser', description: 'Parses the Master File Table (MFT) from an NTFS volume.' },
        { name: 'shellbags', description: 'Prints ShellBags info.' },
        { name: 'shimcache', description: 'Parses the Application Compatibility Shim Cache registry key.' },
        { name: 'mutantscan', description: 'Scans for mutant objects (file-backed shared memory).' },
        { name: 'filesscan', description: 'Scans for FILE_OBJECT objects in memory.' }
      ]
    },
    {
      name: 'Registry Analysis',
      plugins: [
        { name: 'hivelist', description: 'Lists the registry hives present in a memory dump.' },
        { name: 'hivescan', description: 'Scans for registry hives in a memory dump.' },
        { name: 'printkey', description: 'Prints a registry key, and its subkeys and values.' },
        { name: 'userassist', description: 'Prints the UserAssist registry keys and information.' },
        { name: 'hashdump', description: 'Dumps user hashes from the SAM registry hive.' },
        { name: 'lsadump', description: 'Dumps LSA secrets from the registry.' },
        { name: 'dumpregistry', description: 'Dumps registry hives to disk.' }
      ]
    },
    {
      name: 'Malware Detection',
      plugins: [
        { name: 'malfind', description: 'Detects injected code in user mode memory.' },
        { name: 'hollowfind', description: 'Detects evidence of process hollowing.' },
        { name: 'yarascan', description: 'Scans process or kernel memory with Yara signatures.' },
        { name: 'ldrmodules', description: 'Detects unlinked DLLs.' },
        { name: 'apihooks', description: 'Detects API hooks in process and kernel memory.' },
        { name: 'driverirp', description: 'Detects I/O Request Packet (IRP) function hooks in drivers.' },
        { name: 'impscan', description: 'Scans for imports in process or kernel memory.' },
        { name: 'svcscan', description: 'Scans for Windows services.' }
      ]
    },
    {
      name: 'Memory Acquisition',
      plugins: [
        { name: 'memdump', description: 'Dumps the addressable memory for a process.' },
        { name: 'vaddump', description: 'Dumps the Virtually Allocated memory for a process.' },
        { name: 'moddump', description: 'Dumps a kernel driver to an executable file sample.' },
        { name: 'dlldump', description: 'Dumps DLLs from a process address space.' },
        { name: 'procdump', description: 'Dumps a process to an executable file sample.' },
        { name: 'vboxinfo', description: 'Dumps information about a VirtualBox VM.' }
      ]
    },
    {
      name: 'Timeliner',
      plugins: [
        { name: 'timeliner', description: 'Creates a timeline from various artifacts in memory.' },
        { name: 'mftparser', description: 'Parses MFT entries and adds them to the timeline.' },
        { name: 'shellbags', description: 'Parses Shellbags entries and adds them to the timeline.' },
        { name: 'shimcache', description: 'Parses Shimcache entries and adds them to the timeline.' },
        { name: 'userassist', description: 'Parses UserAssist entries and adds them to the timeline.' }
      ]
    }
  ];
  
  
  
 // Variables to keep track of the currently open category and plugin
let openCategoryIndex = -1;
let openPluginIndex = -1;

// Function to create a plugin item
function createPluginItem(plugin, categoryIndex, pluginIndex) {
  // Create a list item element for the plugin
  const pluginItem = document.createElement('li');
  pluginItem.textContent = plugin.name;
  pluginItem.classList.add('plugin-item');
  pluginItem.id = plugin.name;
  
  // Create a div element for the plugin description
  const descriptionItem = document.createElement('div');
  descriptionItem.textContent = plugin.description;
  descriptionItem.classList.add('plugin-description');
  descriptionItem.style.display = 'none';
  
  // Append the description item to the plugin item
  pluginItem.appendChild(descriptionItem);
  
  // Add click event listener to the plugin item
  pluginItem.addEventListener('click', (event) => {
    event.stopPropagation();
    
    // Check if the clicked plugin is different from the currently open plugin
    if (openCategoryIndex !== categoryIndex || openPluginIndex !== pluginIndex) {
      closeOpenPlugin();
      descriptionItem.style.display = 'block';
      descriptionItem.classList.add('open'); // Add 'open' class to the open plugin description
      openCategoryIndex = categoryIndex;
      openPluginIndex = pluginIndex;
    } else {
      // If the same plugin is clicked, close the description
      descriptionItem.style.display = 'none';
      descriptionItem.classList.remove('open'); // Remove 'open' class when closing the plugin description
      openPluginIndex = -1;
    }
  });
  
  return pluginItem;
}

// Function to create a list of plugins
function createPluginList(plugins, categoryIndex) {
  // Create an unordered list element for the plugins
  const pluginList = document.createElement('ul');
  pluginList.classList.add('plugin-list');
  pluginList.style.display = 'none';
  
  // Iterate over each plugin and create a plugin item
  plugins.forEach((plugin, pluginIndex) => {
    const pluginItem = createPluginItem(plugin, categoryIndex, pluginIndex);
    pluginList.appendChild(pluginItem);
  });
  
  return pluginList;
}

// Function to create a category item
function createCategoryItem(category, index) {
  // Create a list item element for the category
  const listItem = document.createElement('li');
  listItem.textContent = category.name;
  listItem.classList.add('category-item');
  listItem.id = `category-${index + 1}`;
  
  // Create a plugin list for the category
  const pluginList = createPluginList(category.plugins, index);
  listItem.appendChild(pluginList);
  
  // Add click event listener to the category item
  listItem.addEventListener('click', () => {
    // Check if the clicked category is different from the currently open category
    if (openCategoryIndex !== index) {
      closeOpenCategory();
      pluginList.style.display = 'block';
      openCategoryIndex = index;
    } else {
      // If the same category is clicked, close the plugin list and any open plugin description
      pluginList.style.display = 'none';
      closeOpenPlugin();
      openCategoryIndex = -1;
    }
    updateAddTabMargin();
  });
  
  return listItem;
}

// Function to close the currently open category
function closeOpenCategory() {
  const openCategory = document.querySelector('.plugin-list[style="display: block;"]');
  if (openCategory) {
    openCategory.style.display = 'none';
    closeOpenPlugin(); // Close any open plugin description when closing the category
  }
}

// Function to close the currently open plugin
function closeOpenPlugin() {
  const openPlugin = document.querySelector('.plugin-description.open'); // Select plugin description with 'open' class
  if (openPlugin) {
    openPlugin.style.display = 'none';
    openPlugin.classList.remove('open'); // Remove 'open' class when closing the plugin description
  }
}

// Function to show or hide the categories
function showCategories() {
  // Get references to the category list, topbar, and add tab button elements
  const categoryList = document.getElementById('category-list');
  const topbar = document.getElementById('topbar');
  const addTabBtn = document.getElementById('addTab1');

  // Check if the category list is currently shown
  if (categoryList.classList.contains('show')) {
    // If shown, hide the category list
    hideCategoryList(categoryList, topbar);
  } else {
    // If hidden, display the category list and add search functionality
    displayCategoryList(categoryList, topbar);
    addSearchFunctionality(categoryList);
  }

  // Update the margin of the add tab button
  updateAddTabMargin();
}

// Function to hide the category list
function hideCategoryList(categoryList, topbar) {
  // Remove the 'show' class from the category list
  categoryList.classList.remove('show');
  // Adjust the left position of the topbar
  topbar.style.left = '65px';
}

// Function to display the category list
function displayCategoryList(categoryList, topbar) {
  // Set the HTML content of the category list
  categoryList.innerHTML = `
    <div class="search-container">
      <input type="text" id="searchInput" placeholder="Search...">
      <ul id="searchResults"></ul>
    </div>
  `;

  // Iterate over each category and create category items
  categories.forEach((category, index) => {
    const categoryItem = createCategoryItem(category, index);
    categoryList.appendChild(categoryItem);
  });

  // Add the 'show' class to the category list
  categoryList.classList.add('show');
  // Adjust the left position of the topbar
  topbar.style.left = '356px';
}

// Function to add search functionality to the category list
function addSearchFunctionality(categoryList) {
  // Get references to the search input and search results elements
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  // Add an event listener to the search input field
  searchInput.addEventListener('input', function() {
    // Get the search term entered by the user and convert it to lowercase
    const searchTerm = this.value.toLowerCase();

    // Check if the search term length is less than or equal to 2 characters
    if (searchTerm.length <= 2) {
      // If the search term is too short, clear the search results
      clearSearchResults(searchResults);
    } else {
      // If the search term is valid, filter the plugins based on the search term
      const filteredPlugins = filterPlugins(searchTerm);
      // Display the filtered plugins in the search results
      displaySearchResults(filteredPlugins);
    }
  });
}

// Function to clear the search results
function clearSearchResults(searchResults) {
  // Set the HTML content of the search results to an empty string
  searchResults.innerHTML = '';
}

// Function to filter plugins based on the search term
function filterPlugins(searchTerm) {
  // Create an empty array to store the filtered plugins
  const filteredPlugins = [];

  // Iterate over each category
  categories.forEach(category => {
    // Filter the plugins within the category based on the search term
    const matchingPlugins = category.plugins.filter(plugin =>
      plugin.name.toLowerCase().includes(searchTerm) ||
      plugin.description.toLowerCase().includes(searchTerm)
    );

    // Add the matching plugins to the filtered plugins array
    filteredPlugins.push(...matchingPlugins);
  });

  // Return the filtered plugins
  return filteredPlugins;
}

// Function to display the search results
function displaySearchResults(filteredPlugins) {
  // Get a reference to the search results element
  const searchResults = document.getElementById('searchResults');
  // Clear the existing search results
  searchResults.innerHTML = '';

  // Check if there are any filtered plugins
  if (filteredPlugins.length > 0) {
    // Create a new unordered list element for the plugin list
    const pluginList = document.createElement('ul');

    // Iterate over each filtered plugin
    filteredPlugins.forEach(plugin => {
      // Create a new list item element for the plugin
      const pluginItem = document.createElement('li');
      // Set the text content of the plugin item to the plugin name and description
      pluginItem.textContent = `${plugin.name}: ${plugin.description}`;
      // Append the plugin item to the plugin list
      pluginList.appendChild(pluginItem);
    });

    // Append the plugin list to the search results
    searchResults.appendChild(pluginList);
  }
}






// Function to remove a tab
function removeTab(tabNumber) {
  const tab = document.getElementById(`tab${tabNumber}`);
  const addTabBtn = document.getElementById('addTab1');

  if (tab) {
    tab.remove();
    tabCount--;
    updateAddTabMargin();
  }
}

// Function to update the margin of the "Add Tab" button
function updateAddTabMargin() {
  const addTabBtn = document.getElementById('addTab1');

  if (openCategoryIndex >= 0) {
    // If a category is open
    if (tabCount > 0) {
      // If at least one tab is open
      addTabBtn.style.marginLeft = '-10px';
      console.log("Category open, tabs open");
    } else {
      // If no tabs are open
      addTabBtn.style.marginLeft = '0px';
      console.log("Category open, no tabs open");
    }
  } else {
    // If no categories are open
    if (tabCount > 0) {
      // If at least one tab is open
      addTabBtn.style.marginLeft = '-10px';
      console.log("No categories open, tabs open");
    } else {
      // If no tabs are open
      addTabBtn.style.marginLeft = '0px';
      console.log("No categories open, no tabs open");
    }
  }
}

// Get the topbar element
const topbar = document.getElementById('topbar');

// Add wheel event listener to the topbar
topbar.addEventListener('wheel', (event) => {
  event.preventDefault();
  topbar.scrollLeft += event.deltaY;
});