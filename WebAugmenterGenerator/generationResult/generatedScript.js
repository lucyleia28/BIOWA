// ==UserScript==
// @name         Birds observations GENERATED
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Augment a webpage to show data points on a map with marker clustering FUNCIONA BIEN
// @match        https://es.wikipedia.org/wiki/Parque_natural_de_las_Lagunas_de_La_Mata_y_Torrevieja
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
        class Observation {
        	constructor(date, lat, long){
        		this.id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        		this.date = date;
        		this.lat = lat;
        		this.long = long;
        		
        		this.variables = [];
        		
        	}
        	addvariables(variables){
        		this.variables.push(variables);
        	}
        	
        }
        
        class Variable {
        	constructor(name, value){
        		this.name = name;
        		this.value = value;
        		
        		
        	}
        	
        }
        
        class DataSet extends Resource {
        	constructor(url) {
        		super(url);
        		
        		
        	}
        	
        }
        
        class DataService extends Resource {
        	constructor(url, path, apiKeyName, apiKeyToken) {
        		super(url);
        		this.path = path;
        		this.apiKeyName = apiKeyName;
        		this.apiKeyToken = apiKeyToken;
        		
        		
        	}
        	
        }
        
        class Element {
        	constructor(xpath){
        if (new.target === Element) {
        			throw new TypeError("Cannot construct Element instances directly");
        		}		this.xpath = xpath;
        		
        		
        	}
        	
        }
        
        class Resource {
        	constructor(url){
        if (new.target === Resource) {
        			throw new TypeError("Cannot construct Resource instances directly");
        		}		this.url = url;
        		
        		
        	}
        	
        }
        
        class Map extends Element {
        	constructor(xpath, latOriginalView, longOriginalView) {
        		super(xpath);
        		this.latOriginalView = latOriginalView;
        		this.longOriginalView = longOriginalView;
        		
        		this.observations = [];
        		
        	}
        	addobservations(observations){
        		this.observations.push(observations);
        	}
        	
        }
        
        class Filter {
        	constructor(name, variable){
        		this.name = name;
        		this.variable = variable;
        		
        		
        	}
        	
        }
        

    let observations = [];
    const latOriginalView = '38.009';
    const longOriginalView = '-0.703';
    const zoom = '12';
    const totalField = 'howMany';
	const websiteType = 'ubication';

    const resources = [new DataSet('https://raw.githubusercontent.com/lucyleia28/AWAG4Maps_La_Mata/main/ebirdObservations.csv', 'animal')];
	let filters = [new Filter('Nombre científico','sciName'),new Filter('Ubicación','locName'),new Filter('Fecha','obsDt')];

	loadStyleSheet('https://unpkg.com/leaflet/dist/leaflet.css');
    loadStyleSheet('https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css');
    loadStyleSheet('https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css');
    loadOwnStyleSheet();

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js')
    .then(() => loadScript('https://unpkg.com/leaflet/dist/leaflet.js'))
    .then(() => loadScript('https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js'))
    .then(() => loadScript('https://cdn.plot.ly/plotly-latest.min.js'))
    .then(() => initializeMap())
    .catch(error => console.error('Error loading scripts:', error));

    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    function loadStyleSheet(url) {
        let css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = url;
        document.head.appendChild(css);
    }

    function loadOwnStyleSheet(){
        const style = document.createElement('style');
        style.textContent  = `
        #main-container {
            display: flex;
            width: calc(100% - 50px);
            height: 600px;
            margin: 0.5em auto 2em auto;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            background-color: #fff;
        }
        #map-container {
            width: 60%;
            height: 100%;
        }
        #empty-container {
            width: 40%;
            height: 100%;
            background-color: #f0f0f0;
            padding: 20px;
        }
        #filter-select {
            cursor: pointer;
            background-color: #f0f8ff;
            color: #007BFF;
            border: 1px solid #007BFF;
            border-radius: 5px;
            padding: 10px;
            font-size: 16px;
            font-family: Arial, sans-serif;
            width: 100%;
            outline: none;
            box-shadow: 0 2px 5px rgba(0, 123, 255, 0.2);
            appearance: none;
            position: relative;
            margin: 10px 0;
        }
        #filter-container {
            padding: 10px;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            height: 180px;
            border: 1px;
            border-radius: 5px;
            background-color: rgb(240, 248, 255);
            box-shadow: rgba(0, 123, 255, 0.2) 0px 2px 5px;
        }
        #filter-option {
            cursor : pointer;
        }
        label#variable-name {
            margin: 5px 0 5px 0;
            cursor: pointer;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
        }
        input#variable-value {
            margin-right: 10px;
            width: 20px;
            height: 20px;
            cursor: pointer;
            accent-color: #007BFF;
            flex-shrink: 0;
        }
        #map {
            width: 100%;
            height: 100%;
        }
        .main-layer-item {
            position: relative;
            margin: 0 0.5rem 0 0;
            min-height: 1.2rem;
            width: 2rem;
            display: flex;
        }
        .main-layer-item.red {
            background-color: #E33B15;
        }
        .main-layer-item.orange {
            background-color: #E57701;
        }
        .main-layer-item.yellow {
            background-color: #FAC500;
        }
        .main-layer-item.green {
            background-color: #C7E466;
        }
        .main-layer-item.gray {
            background-color: #8F9CA0;
        }
        #deselect-button {
            cursor: pointer;
            background-color: #f0f8ff;
            color: #007BFF;
            border: 1px solid #007BFF;
            border-radius: 5px;
            padding: 10px;
            font-size: 16px;
            font-family: Arial, sans-serif;
            outline: none;
            box-shadow: 0 2px 5px rgba(0, 123, 255, 0.2);
            appearance: none;
            position: relative;
            margin: 10px 0;
        }
        #deselect-button:hover {
            background-color: #007BFF;
            color: #f0f8ff;
        }
        `;
        document.head.appendChild(style);
    }

    function createLegend() {
        const legend = document.createElement('div');
        legend.innerHTML += `<div class="main-layer" style="display:flex;">
             <div class="main-layer-item red"></div>
             <div class="main-layer-label">
                 <div class="main-layer-title">&gt; 100</div>
             </div>
         </div>

         <div class="main-layer" style="display:flex;">
             <div class="main-layer-item orange"></div>
             <div class="main-layer-label">
                 <div class="main-layer-title">50 - 100</div>
             </div>
         </div>

         <div class="main-layer" style="display:flex;">
             <div class="main-layer-item yellow"></div>
             <div class="main-layer-label">
                 <div class="main-layer-title">10 - 50</div>
             </div>
         </div>

         <div class="main-layer" style="display:flex;">
             <div class="main-layer-item green"></div>
             <div class="main-layer-label">
                 <div class="main-layer-title">5 - 10</div>
             </div>
         </div>

         <div class="main-layer" style="display:flex;">
             <div class="main-layer-item gray"></div>
             <div class="main-layer-label">
                 <div class="main-layer-title">&lt; 5</div>
             </div>
         </div>`;
        return legend;
    }

	function initializeMap() {
        const coordinatesExist = !!document.getElementById('coordinates');
        const pathParts = window.location.pathname.split('/')[2]?.split('_');

        if (!pathParts) {
            return 'ERROR: Invalid path';
        }

        let mapParam = null;
        let filterKey = null;

        switch (websiteType) {
            case 'ubication':
                if (coordinatesExist) {
                    filterKey = 'locName';
                } else {
                    return 'ERROR: No map could be loaded';
                }
                break;

            case 'observation':
                if (!coordinatesExist) {
                    mapParam = pathParts.join(' ').replace('_', ' ');
                    filterKey = 'sciName';
                } else {
                    return 'ERROR: No map could be loaded';
                }
                break;

            case 'date':
                if (!coordinatesExist) {
                    const [day, , month] = pathParts;
                    const monthNumber = monthToNumber(month);
                    if (day && monthNumber) {
                        mapParam = `${monthNumber}-${day}`;
                        filterKey = 'obsDt';
                    } else {
                        return 'ERROR: No map could be loaded';
                    }
                } else {
                    return 'ERROR: No map could be loaded';
                }
                break;

            default:
                return 'ERROR: Invalid map type';
        }

        if (filterKey) {
            filters = filters.filter(filter => filter.variable !== filterKey);
        }

        initializeMapByType(mapParam);
    }

    function monthToNumber(month) {
        if (typeof month !== 'string') {
            return null;
        }
        else {
            let months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            let number = months.indexOf(month.toLowerCase()) + 1;
            if(number === 0){
                return null;
            }
            else{
                return number < 10 ? `0${number}` : `${number}`;
            }
        }
    }

    function initializeMapByType(specificValue) {
        const title = document.createElement('h2');
        title.innerText = 'Mapa Interactivo: Avistamientos de aves';

        const mainContainer = document.createElement('div');
        mainContainer.id = 'main-container';

        const mapContainer = document.createElement('div');
        mapContainer.id = 'map-container';

        const emptyContainer = document.createElement('div');
        emptyContainer.id = 'empty-container';

        const filterTitle = document.createElement('h3');
        filterTitle.innerText = 'Filtrar observaciones';
        filterTitle.style.textAlign = 'center';
        emptyContainer.appendChild(filterTitle);

        const filterSelect = document.createElement('select');
        filterSelect.id = 'filter-select';
        filters.forEach((filter, index) => {
            const option = document.createElement('option');
            option.id = 'filter-option';
            option.value = index;
            option.innerText = 'Variable: ' + filter.name;
            filterSelect.appendChild(option);
        });
        emptyContainer.appendChild(filterSelect);

        const filterContainer = document.createElement('div');
        filterContainer.id = 'filter-container';
        emptyContainer.appendChild(filterContainer);

        const deselectButton = document.createElement('button');
        deselectButton.id = 'deselect-button';
        deselectButton.innerText = 'Borrar selección y ver todos';
        deselectButton.onclick = () => deselectAllCheckboxes(map, markers, mapInstance);
        emptyContainer.appendChild(deselectButton);

        const filterLegend = document.createElement('h3');
        filterLegend.innerText = 'Número de observaciones';
        emptyContainer.appendChild(filterLegend);

        const legend = createLegend();
        emptyContainer.appendChild(legend);

        const mapInstance = new Map(`//div[@class='mw-content-ltr mw-parser-output']`, latOriginalView, longOriginalView);
        let map;

        const xpathResult = document.evaluate(mapInstance.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

        if (xpathResult.singleNodeValue) {
            const targetElement = xpathResult.singleNodeValue;
            const parent = targetElement.parentNode;

            parent.insertBefore(title, targetElement);
            parent.insertBefore(mainContainer, targetElement);
        } else {
            console.error('No node was found with the XPath provided.');
            return;
        }

        const mapElement = document.createElement('div');
        mapElement.id = 'map';
        mapContainer.appendChild(mapElement);
        mainContainer.appendChild(mapContainer);

        map = L.map(mapElement.id).setView([mapInstance.latOriginalView, mapInstance.longOriginalView], zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mainContainer.appendChild(emptyContainer);

        const markers = L.markerClusterGroup();

        processResources(resources).then(() => {
            if (websiteType != 'ubication') {
                observations = filterObservationResult(specificValue);
            }

            observations.forEach(obs => mapInstance.addobservations(obs));
            addLayerPoints(map, markers, mapInstance.observations);

            createFilterCheckboxes(filterContainer, map, markers, mapInstance, filterSelect.value);

        }).catch(error => {
            console.error('Error procesando los recursos:', error);
        });

        filterSelect.onchange = () => {
            createFilterCheckboxes(filterContainer, map, markers, mapInstance, filterSelect.value);
        };
    }

    function filterObservationResult(specificValue){
        if(specificValue != null && typeof specificValue === 'string'){
            let filteredObservations = observations.filter(observation =>
                                                           observation.variables.some(variable =>
                                                                                      String(variable.value).includes(specificValue)
                                                                                     )
                                                          );

            return filteredObservations;
        }
        else {
            return null;
        }
        return observations;
    }

    let activeFiltersByCategory = {};
    function createFilterCheckboxes(container, map, markers, mapInstance, selectedFilterIndex) {
        container.innerHTML = '';
        const selectedFilter = filters[selectedFilterIndex];
        const filterKey = selectedFilter.variable;
        const variableNames = new Set();
        const fragment = document.createDocumentFragment();

        if (!activeFiltersByCategory[filterKey]) {
            activeFiltersByCategory[filterKey] = new Set();
        }

        mapInstance.observations.forEach(observation => {
            observation.variables.forEach(variable => {
                if (variable.name === filterKey) {
                    variableNames.add(variable.value);
                }
            });
        });

        variableNames.forEach(variableName => {
            const label = document.createElement('label');
            label.id = 'variable-name';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'variable-value';
            checkbox.value = variableName;

            checkbox.checked = activeFiltersByCategory[filterKey].has(variableName);
            checkbox.onchange = () => {
                if (checkbox.checked) {
                    activeFiltersByCategory[filterKey].add(variableName);
                } else {
                    activeFiltersByCategory[filterKey].delete(variableName);
                }
                updateMapVisibility(map, markers, mapInstance);
            };

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(variableName));
            fragment.appendChild(label);
        });

        container.appendChild(fragment);
    }


    function deselectAllCheckboxes(map, markers, mapInstance) {
        const checkboxes = document.querySelectorAll(`#filter-container input[type=checkbox]`);
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        Object.keys(activeFiltersByCategory).forEach(key => {
            activeFiltersByCategory[key].clear();
        });

        updateMapVisibility(map, markers, mapInstance);
    }

    let visibleObservations = {};
    function updateMapVisibility(map, markers, mapInstance) {
        markers.clearLayers();

        const hasActiveFilters = Object.values(activeFiltersByCategory).some(set => set.size > 0);
        if (!hasActiveFilters) {
            visibleObservations = {};
            mapInstance.observations.forEach(obs => {
                addObservationToMap(obs, markers);
                visibleObservations[obs.id] = true;
            });
            map.addLayer(markers);
            return;
        }

        visibleObservations = {};

        mapInstance.observations.forEach(observation => {
            let isVisible = Object.entries(activeFiltersByCategory).every(([filterKey, filterValues]) => {
                if (filterValues.size === 0) return true;
                return observation.variables.some(variable => variable.name === filterKey && filterValues.has(variable.value));
            });

            visibleObservations[observation.id] = isVisible;

            if (isVisible) {
                addObservationToMap(observation, markers); // Llama a la función centralizada
            }
        });

        if (markers.getLayers().length > 0) {
            map.addLayer(markers);
        }
    }

    function addObservationToMap(observation, markers) {
        let total = getTotalObservationAmount(observation);
        const color = getColorBasedOnValue(total);
        const observationPoint = L.circleMarker([observation.lat, observation.long], {
            radius: 8,
            fillColor: color,
            color: 'black',
            weight: 2,
            opacity: 1,
            fillOpacity: 1,
        });

        const popupContent = formatPopupContent(observation); // Usa la función de formateo
        observationPoint.bindPopup(popupContent);
        markers.addLayer(observationPoint);
    }

    async function processResources(resources) {
        for (const resource of resources) {
            if (resource instanceof DataService) {
                await processDataService(resource);
            } else if (resource instanceof DataSet) {
                await processDataSet(resource);
            }
        }
    }

    async function processDataService(dataService) {
        const dateField = 'obsDt';
        const latField = 'lat';
        const longField = 'lng';

        try {
            const response = await fetch(dataService.url + dataService.path, {
                headers: { [dataService.apiKeyName]: dataService.apiKeyToken }
            });
            const data = await response.json();
            data.forEach(item => {
                const observation = new Observation(item[dateField], item[latField], item[longField]);
                for (const key in item) {
                    if (item.hasOwnProperty(key) && key !== latField && key !== longField) {
                        observation.addvariables(new Variable(key, item[key]));
                    }
                }
                observations.push(observation);
            });
        } catch (error) {
            console.error('ERROR processing DataService:', error);
        }
    }

    async function processDataSet(dataSet) {
        const dateField = 'obsDt';
        const latField = 'lat';
        const longField = 'lng';

        try {
            const response = await fetch(dataSet.url);
            const text = await response.text();
            const rows = text.split('\n');
            const headers = rows[0].split(',');
            for (let i = 1; i < rows.length; i++) {
                if(rows[i]){
                    const cells = rows[i].split(',');
                    const observation = new Observation(cells[headers.indexOf(dateField)], parseFloat(cells[headers.indexOf(latField)]), parseFloat(cells[headers.indexOf(longField)]));
                    for (let j = 0; j < headers.length; j++) {
                        if (headers[j] !== latField && headers[j] !== longField) {
                            observation.addvariables(new Variable(headers[j], cells[j]));
                        }
                    }
                    observations.push(observation);
                }
            }
        } catch (error) {
            console.error('ERROR processing DataSet:', error);
        }
    }

    function getTotalObservationAmount(observation) {
        const howManyVariable = observation.variables.find(variable => variable.name === totalField);
        return howManyVariable ? parseInt(howManyVariable.value) : 0;
    }

    function formatPopupContent(observation) {
        let popupContent = '';
        observation.variables.forEach(variable => {
            popupContent += `<strong>${variable.name}</strong>: ${variable.value}<br>`;
        });
        return popupContent;
    }

    function addLayerPoints(map, markers, observations) {
        const groupedObservations = groupObservationsByLocation(observations);
        groupedObservations.forEach(group => {
            group.observations.forEach(observation => {
                visibleObservations[observation.id] = true;
                addObservationToMap(observation, markers);
            });
        });

        map.addLayer(markers);
    }

    function groupObservationsByLocation(observations) {
        const grouped = {};
        observations.forEach(observation => {
            const key = `${observation.lat},${observation.long}`;
            if (!grouped[key]) {
                grouped[key] = {
                    observations: []
                };
            }
            grouped[key].observations.push(observation);
        });
        return Object.values(grouped);
    }

    function getColorBasedOnValue(value) {
        if (value <= 5) return '#8F9CA0';
        if (value > 5 && value <= 10) return '#C7E466';
        if (value > 10 && value <= 50) return '#FAC500';
        if (value > 50 && value <= 100) return '#E57701';
        if (value > 100) return '#E33B15';
        return 'grey';
    }
})();
