
//##################################################################//
//############## GLOBALE VARIABLES AND EVENT LISTENERS #############//
//##################################################################//


// Variable to keep track of the number of tabs
var tabCount = 0;

// Defines categories
let categories = [];

 // Variables to keep track of the currently open category and plugin
 let openCategoryIndex = -1;
 let openPluginIndex = -1;


// Get the topbar element
const topbar = document.getElementById('topbar');

// Add wheel event listener to the topbar
topbar.addEventListener('wheel', (event) => {
  event.preventDefault();
  topbar.scrollLeft += event.deltaY;
});



//##################################################################//
//######################### FETCH DATABASE #########################//
//##################################################################//

// Fetch the JSON file used as a database for plugins
// Create a new XMLHttpRequest object
const xhr = new XMLHttpRequest();

// Set up a function to handle the response when the request's state changes
xhr.onreadystatechange = function() {
  // Check if the request is complete (readyState === 4)
  if (xhr.readyState === XMLHttpRequest.DONE) {
    // Check if the request was successful (status === 200)
    if (xhr.status === 200) {
      // Parse the response text as JSON and store it in the 'categories' variable
      categories = JSON.parse(xhr.responseText);
      console.log(categories); // Check if the data is loaded correctly
      // Use the 'categories' array here for further processing
    } else {
      // If the request was not successful, log an error message with the status code
      console.error('Error loading JSON file:', xhr.status);
    }
  }
};

// Open a GET request to the 'mockDatabase.json' file, with async set to true
xhr.open('GET', 'mockDatabase.json', true);

// Send the request
xhr.send();



//##################################################################//
//######################### TABS FUNCTIONS #########################//
//##################################################################//

// Function for extracting filename from filepath
function extractFileName(filePath) {
  // Split the file path by / or \
  const parts = filePath.split(/[/\\]/);
  
  // Return the last part of the file path, which is the file name
  return parts[parts.length - 1];
}



// Function to handle opening a new tab
function openNewTab() {
  addTabs();
  const categoryList = document.getElementById('category-list');
  const topbar = document.getElementById('topbar');
  hideCategoryList(categoryList, topbar);
}

// Function to add new tabs
function addTabs(filePath = '') {
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

    if (filePath) {
      tabText.textContent = `${extractFileName(filePath)}`;
    } else {
      tabText.textContent = `New Tab ${tabCount}`;
    }
        
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
  

//##################################################################//
//######################## PLUGIN FUNCTIONS ########################//
//##################################################################//


// Function to create a plugin item
function createPluginItem(plugin, categoryIndex, pluginIndex) {
  // Create a list item element for the plugin
  const pluginItem = document.createElement('li');
  pluginItem.textContent = plugin.name;
  pluginItem.classList.add('plugin-item');
  pluginItem.id = plugin.name;
  pluginItem.setAttribute('data-plugin-name', plugin.name);
  
  // Create a div element for the plugin description
  const descriptionItem = createDescriptionItem(plugin.description);
  
  // Append the description item to the plugin item
  pluginItem.appendChild(descriptionItem);
  
  // Add click event listener to the plugin item
  pluginItem.addEventListener('click', (event) => {
    handlePluginClick(event, categoryIndex, pluginIndex, descriptionItem, pluginItem);
  });
  
  return pluginItem;
}

// Function to create a description item
function createDescriptionItem(description) {
  const descriptionItem = document.createElement('div');
  const formattedDescription = formatDescription(description);
  descriptionItem.innerHTML = formattedDescription; // Using innerHTML to interpret HTML tags
  descriptionItem.classList.add('plugin-description');
  descriptionItem.style.display = 'none';
  return descriptionItem;
}

// Function to format the description string
function formatDescription(description) {
  // Replace newline characters with HTML line breaks
  return description.replace(/\n/g, "<br>");
}

// Function to handle plugin click event
function handlePluginClick(event, categoryIndex, pluginIndex, descriptionItem, pluginItem) {
  event.stopPropagation();
  
  // Check if the clicked plugin is different from the currently open plugin
  if (openCategoryIndex !== categoryIndex || openPluginIndex !== pluginIndex) {
    closeOpenPlugin();
    openPlugin(descriptionItem, categoryIndex, pluginIndex);
  } else {
    // If the same plugin is clicked, close the description
    closePlugin(descriptionItem);
  }
  
  // Get the plugin name from the data attribute
  const pluginName = pluginItem.getAttribute('data-plugin-name');
  
  // Call the Python function to run the plugin
  runPlugin(pluginName);
}

// Function to open a plugin
function openPlugin(descriptionItem, categoryIndex, pluginIndex) {
  descriptionItem.style.display = 'block';
  descriptionItem.classList.add('open');
  openCategoryIndex = categoryIndex;
  openPluginIndex = pluginIndex;
}

// Function to close a plugin
function closePlugin(descriptionItem) {
  descriptionItem.style.display = 'none';
  descriptionItem.classList.remove('open');
  openPluginIndex = -1;
}

// Function to close the currently open plugin
function closeOpenPlugin() {
  const openPlugin = document.querySelector('.plugin-description.open');
  if (openPlugin) {
    closePlugin(openPlugin);
  }
}

// Function to run a plugin
function runPlugin(pluginName) {
  pywebview.api.run_plugin(pluginName).then((output) => {
    console.log(`Plugin ${pluginName} executed with output: ${output}`);
    displayPluginOutput(output);
  });
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

//##################################################################//
//###################### CATEGORIES FUNCTIONS ######################//
//##################################################################//

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
      // Remove the 'selected' class from the previously selected category
      if (openCategoryIndex !== -1) {
        const prevCategoryItem = document.getElementById(`category-${openCategoryIndex + 1}`);
        prevCategoryItem.classList.remove('selected');
      }
      
      // Add the 'selected' class to the clicked category
      listItem.classList.add('selected');
      
      closeOpenCategory();
      pluginList.style.display = 'block';
      openCategoryIndex = index;
    } else {
      // If the same category is clicked, close the plugin list and any open plugin description
      pluginList.style.display = 'none';
      closeOpenPlugin();
      openCategoryIndex = -1;
      
      // Remove the 'selected' class from the clicked category
      listItem.classList.remove('selected');
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


// Function to show or hide the categories
function showCategories() {
  // Get references to the category list, topbar, and add tab button elements
  const categoryList = document.getElementById('category-list');
  const topbar = document.getElementById('topbar');
  const dataTable = document.getElementById('dataTable')
  const addTabBtn = document.getElementById('addTab1');

  // Check if the category list is currently shown
  if (categoryList.classList.contains('show')) {
    // If shown, hide the category list
    hideCategoryList(categoryList, topbar, dataTable);
  } else {
    // If hidden, display the category list and add search functionality
    displayCategoryList(categoryList, topbar, dataTable);
    addSearchFunctionality(categoryList);
  }

  // Update the margin of the add tab button
  updateAddTabMargin();
}

// Function to hide the category list
function hideCategoryList(categoryList, topbar, dataTable) {
  pluginsBtn = document.getElementById("pluginsBtn")
  // Remove the 'show' class from the category list
  categoryList.classList.remove('show');
  // Adjust the left position of the topbar
  topbar.style.left = '65px';
  dataTable.style.left = '65px'
  pluginsBtn.classList.remove('selected');
}

// Function to display the category list
function displayCategoryList(categoryList, topbar, dataTable) {
  // Set the HTML content of the category list
  pluginsBtn = document.getElementById("pluginsBtn")
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
  dataTable.style.left = '365px';
  pluginsBtn.classList.add('selected');
}


//##################################################################//
//######################## SEARCH FUNCTIONS ########################//
//##################################################################//

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




//##################################################################//
//########################## FILE HANDLING #########################//
//##################################################################//



function handleFileSelect() {
  pywebview.api.openFileDialog().then((filePath) => {
    console.log('File selected');
    clearDataTable();
    showCategories();
    addTabs(filePath);
    pywebview.api.debug(`File Path: ${filePath}`);
  });
}

function handleDragOver(event) {
  event.preventDefault();
}

function clearDataTable() {
  const dataTable = document.querySelector('.dataTable');
  dataTable.innerHTML = '';
}

function restoreDataTableUploadFile() {
  const dataTable = document.querySelector('.dataTable');
  dataTable.innerHTML = `
    <input type="file" id="fileInput" style="display: none" />
    <button id="selectFileBtn">Velg fil</button>
    <div id="dropzone">
      Dra og slipp en fil her, eller klikk på knappen over for å velge fil
    </div>
  `;
  
  const selectFileBtn = document.getElementById('selectFileBtn');
  const dropzone = document.getElementById('dropzone');

  selectFileBtn.addEventListener('click', handleFileSelect);
  dropzone.addEventListener('dragover', handleDragOver);
}

const selectFileBtn = document.getElementById('selectFileBtn');
const dropzone = document.getElementById('dropzone');
const addFileBtn = document.getElementById('addFileBtn');

selectFileBtn.addEventListener('click', handleFileSelect);
dropzone.addEventListener('dragover', handleDragOver);
addFileBtn.addEventListener('click', handleFileSelect);



//##################################################################//
//##################### DISPLAY DATA FUNCTIONS #####################//
//##################################################################//


function displayPluginOutput(output) {
  try {
    // Get the dataTable div element
    const dataTableDiv = document.querySelector('.dataTable');

    // Create a new div element for the plugin output
    const pluginOutputDiv = document.createElement('div');
    pluginOutputDiv.classList.add('plugin-output');

    // Create a table element for the plugin output
    const pluginOutputTable = document.createElement('table');

    // Parse the JSON output
    const data = JSON.parse(output);

    // Create the table header
    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (const key in data[0]) {
      const th = document.createElement('th');
      th.textContent = key;
      headerRow.appendChild(th);
    }
    tableHeader.appendChild(headerRow);
    pluginOutputTable.appendChild(tableHeader);

    // Create the table body
    const tableBody = document.createElement('tbody');
    data.forEach(rowData => {
      const row = document.createElement('tr');
      for (const key in rowData) {
        const cell = document.createElement('td');
        cell.textContent = rowData[key];
        row.appendChild(cell);
      }
      tableBody.appendChild(row);
    });
    pluginOutputTable.appendChild(tableBody);

    // Create a container div for the table
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    tableContainer.style.maxHeight = '100%'; // Set a fixed height for the container
    tableContainer.style.overflowY = 'auto'; // Enable vertical scrolling

    // Append the table element to the container div
    tableContainer.appendChild(pluginOutputTable);

    // Append the container div to the plugin output div
    pluginOutputDiv.appendChild(tableContainer);

    // Append the plugin output div to the dataTable div
    dataTableDiv.appendChild(pluginOutputDiv);
  } catch (error) {
    // Log the error using the debug function
    pywebview.api.debug(`Error in displayPluginOutput: ${error}`);
  }
}







