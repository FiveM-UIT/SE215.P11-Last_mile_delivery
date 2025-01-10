import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockService } from '../services/mockService';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiList, FiX, FiMapPin, FiClock, FiPackage } from 'react-icons/fi';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

// Thêm Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpZW5nIiwiYSI6ImNtNTkwY3R4ZDNybHUyanNmM2hoaDAxa2oifQ.ZUcv_MrKBuTc2lZ2jyofmQ';

// Thêm styles cho route
const routeStyles = {
  border: {
    'line-color': '#000000',
    'line-width': 12,
    'line-opacity': 0.2
  },
  outline: {
    'line-color': '#ffffff',
    'line-width': 8,
    'line-opacity': 1
  },
  main: {
    'line-color': '#4285F4', // Màu xanh của Google Maps
    'line-width': 6,
    'line-opacity': 1
  }
};

// Thêm styles cho markers
const createMarkerElement = (index, isFirst, isLast, total) => {
  const el = document.createElement('div');
  el.className = 'marker';
  
  // Xác định màu dựa vào vị trí
  const backgroundColor = isFirst ? '#1B5E20' :  // Điểm đầu màu xanh lá đậm
                         isLast ? '#B71C1C' :    // Điểm cuối màu đỏ đậm
                         '#1976D2';              // Điểm giữa màu xanh dương

  // Style cho marker container
  Object.assign(el.style, {
    backgroundColor: 'white',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '3px solid ' + backgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    fontSize: '14px',
    fontWeight: 'bold',
    color: backgroundColor,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    willChange: 'transform'
  });

  // Thêm hover effect
  el.onmouseenter = () => {
    el.style.transform = 'scale(1.1)';
  };
  el.onmouseleave = () => {
    el.style.transform = 'scale(1)';
  };

  el.innerHTML = `${index}`;
  return el;
};

// Thêm component StopCard để hiển thị thông tin điểm dừng
const StopCard = ({ shop, index, total, isDarkMode }) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 mb-3 transition-colors">
      <div className="flex items-center gap-3">
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
            isFirst ? 'bg-[#1B5E20]' : 
            isLast ? 'bg-[#B71C1C]' : 
            'bg-[#1976D2]'
          }`}
        >
          {index + 1}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {shop.shop_details.shop_name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {shop.shop_details.address}
          </p>
        </div>
      </div>
    </div>
  );
};

// Thêm biến để lưu trữ style URLs
const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/streets-v11',
  dark: 'mapbox://styles/mapbox/dark-v11'
};

const DeliveryMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const animationRef = useRef(null);
  const animationStartRef = useRef(null);
  const markerRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);

  const createIntermediatePoints = (coordinates, numPoints = 10) => {
    let interpolatedPoints = [];
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];
      
      const line = turf.lineString([start, end]);
      const lineLength = turf.length(line, { units: 'kilometers' });
      
      for (let j = 0; j <= numPoints; j++) {
        const segment = j / numPoints;
        const point = turf.along(line, lineLength * segment, { units: 'kilometers' });
        interpolatedPoints.push(point.geometry.coordinates);
      }
    }
    
    return interpolatedPoints;
  };

  const animateMarker = () => {
    if (currentPointIndex >= routeCoordinates.length - 1) {
      clearInterval(animationRef.current);
      return;
    }

    const currentPoint = routeCoordinates[currentPointIndex];
    const nextPoint = routeCoordinates[currentPointIndex + 1];

    if (markerRef.current && currentPoint && nextPoint) {
      const start = turf.point(currentPoint);
      const end = turf.point(nextPoint);
      const bearing = turf.bearing(start, end);
      
      const animate = (timestamp) => {
        if (!animationStartRef.current) animationStartRef.current = timestamp;
        const progress = (timestamp - animationStartRef.current) / 1000;
        
        if (progress < 1) {
          const interpolated = turf.along(
            turf.lineString([currentPoint, nextPoint]),
            turf.distance(start, end) * progress,
            { units: 'kilometers' }
          );
          
          const newCoords = interpolated.geometry.coordinates;
          markerRef.current.setLngLat(newCoords);
          
          if (isPopupOpen && popupRef.current) {
            popupRef.current.setLngLat(newCoords);
          }

          const markerEl = markerRef.current.getElement();
          const markerContent = markerEl.querySelector('.marker-content');
          if (markerContent) {
            markerContent.style.transform = `rotate(${bearing}deg)`;
          }
          
          animationRef.current = requestAnimationFrame(animate);
        } else {
          animationStartRef.current = null;
          setCurrentPointIndex(prev => prev + 1);
        }
      };
      
      requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      animateMarker();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [currentPointIndex, routeCoordinates]);

  const initializeMap = async (routeData) => {
    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: isDarkMode ? 
          'mapbox://styles/mapbox/dark-v11' : 
          'mapbox://styles/mapbox/streets-v11',
        center: [routeData.shops[0].shop_details.longitude, routeData.shops[0].shop_details.latitude],
        zoom: 13
      });

      mapRef.current = map;

      map.on('load', async () => {
        const coordinates = routeData.shops.map(shop => [
          shop.shop_details.longitude,
          shop.shop_details.latitude
        ]);

        // Thêm markers cho điểm đầu và điểm cuối
        routeData.shops.forEach((shop, index) => {
          const isFirstStop = index === 0;
          const isLastStop = index === routeData.shops.length - 1;
          
          // Chỉ tạo marker cho điểm đầu và điểm cuối
          if (isFirstStop || isLastStop) {
            const el = document.createElement('div');
            el.className = 'marker';
            
            // Style cho marker trực tiếp như trong CustomerMap
            Object.assign(el.style, {
              backgroundColor: isFirstStop ? '#10B981' : '#EF4444',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            });

            el.innerHTML = isFirstStop ? 'A' : 'B';

            // Tạo popup cho marker
            const popup = new mapboxgl.Popup({
              offset: 25,
              closeButton: false,
              className: 'custom-popup'
            }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${isFirstStop ? 'Điểm đầu' : 'Điểm cuối'}</h3>
                <p class="text-sm">${shop.shop_details.shop_name}</p>
              </div>
            `);

            // Thêm marker vào map
            new mapboxgl.Marker(el)
              .setLngLat([shop.shop_details.longitude, shop.shop_details.latitude])
              .setPopup(popup)
              .addTo(map);
          }
        });

        // Lấy route directions từ Mapbox API
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.map(coord => coord.join(',')).join(';')}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const json = await query.json();
        const routeGeometry = json.routes[0].geometry;

        // Thêm route layers với màu sắc đúng
        map.addLayer({
          id: 'route-border',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeGeometry
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#000000',
            'line-width': 12,
            'line-opacity': 0.2
          }
        });

        map.addLayer({
          id: 'route-outline',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeGeometry
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 8,
            'line-opacity': 1
          }
        });

        map.addLayer({
          id: 'route-main',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeGeometry
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#4285F4',
            'line-width': 6,
            'line-opacity': 1
          }
        });

        // Fit bounds
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds, { 
          padding: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100
          }
        });

        // Thêm delivery vehicle marker
        const el = document.createElement('div');
        el.className = 'delivery-marker';
        el.innerHTML = `
          <div class="marker-content">
            <div class="pulse-ring"></div>
            <svg class="delivery-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.15 8a2 2 0 0 0-1.72-1H15V5a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 1 1.73 3.49 3.49 0 0 0 7 .27h3.1a3.48 3.48 0 0 0 6.9 0 2 2 0 0 0 2-2v-3a1.07 1.07 0 0 0-.15-.52zM15 9h2.43l1.8 3H15zM6.5 19A1.5 1.5 0 1 1 8 17.5 1.5 1.5 0 0 1 6.5 19zm10 0a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5z"/>
            </svg>
          </div>
        `;

        // Tạo popup cho delivery vehicle
        popupRef.current = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          className: 'custom-popup',
          maxWidth: '300px',
          offset: [0, -15]
        })
        .setHTML(`
          <div class="p-3">
            <div class="flex items-center space-x-3 mb-2">
              <div class="flex-shrink-0">
                <img 
                  src="${routeData.delivery_staff_id.avatar}" 
                  alt="${routeData.delivery_staff_id.fullName}"
                  class="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">${routeData.delivery_staff_id.fullName}</h3>
                <p class="text-sm text-gray-600">${routeData.delivery_staff_id.phone}</p>
              </div>
            </div>
            <div class="text-sm text-gray-500">
              <p>Đang giao hàng</p>
            </div>
          </div>
        `);

        // Tạo marker và thêm vào map
        markerRef.current = new mapboxgl.Marker(el)
          .setLngLat([routeData.current_location.longitude, routeData.current_location.latitude])
          .addTo(map);

        // Lấy route và tạo điểm trung gian
        const route = json.routes[0].geometry.coordinates;
        const detailedRoute = createIntermediatePoints(route);
        setRouteCoordinates(detailedRoute);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map');
      toast.error('Failed to initialize map');
    }
  };

  useEffect(() => {
    fetchRouteData();
  }, [id]);

  useEffect(() => {
    if (route && mapContainerRef.current && !mapRef.current) {
      initializeMap(route);
    }
  }, [route]);

  const fetchRouteData = async () => {
    try {
      const response = await mockService.getRoute(id);
      if (response.success) {
        console.log('Full route data:', response.data);
        console.log('Shops data:', response.data.shops);
        setRoute(response.data);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setError(error.message || 'Failed to load route data');
      toast.error('Failed to load route data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Responsive Header */}
      <div className="bg-white shadow-md px-3 sm:px-4 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            {/* Mobile-optimized navigation and info */}
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 sm:px-3 sm:py-2 text-gray-700 hover:text-blue-600 
                  bg-gray-100 hover:bg-blue-50 rounded-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Back to routes page"
              >
                <FiArrowLeft className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline font-medium">Back</span>
              </button>
              
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                  <span className="hidden sm:inline">Route Details</span>
                  <span className="sm:hidden">Route</span>
                </h1>
                {route && (
                  <div className="mt-0.5 flex items-center text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Code:</span>
                    <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 
                      bg-blue-100 text-blue-800 rounded-md">
                      {route.route_code}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile-optimized status */}
            {route && (
              <div className="flex items-center justify-between sm:justify-end 
                space-x-3 sm:space-x-6 bg-gray-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Live</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiClock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-600" />
                    <span>~{Math.ceil(route.distance * 3)} mins</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Controls and Sidebar Toggle */}
        <div className="absolute top-2 right-2 flex flex-col items-end space-y-2 z-10">
          {/* Zoom Controls */}
          <div className="bg-white rounded-lg shadow-lg p-1 flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-1">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-700 
                hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              aria-label="Zoom in"
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-700 
                hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              aria-label="Zoom out"
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>

          {/* Sidebar Toggle - Mobile Only */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden bg-white rounded-lg shadow-lg p-2 
              hover:bg-blue-50 transition-colors"
            aria-label="Toggle stops list"
          >
            {showSidebar ? 
              <FiX className="w-5 h-5 text-gray-600" /> : 
              <FiList className="w-5 h-5 text-gray-600" />
            }
          </button>
        </div>

        {/* Mobile Legend */}
        <div className="fixed bottom-2 left-2 right-2 sm:left-1/2 sm:right-auto 
          sm:transform sm:-translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg 
          shadow-lg p-2 sm:p-4 border border-gray-100/50 z-10">
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#1B5E20] rounded-full sm:mr-2" />
              <span className="text-[10px] sm:text-sm font-medium text-gray-700 mt-0.5 sm:mt-0">Start</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#B71C1C] rounded-full sm:mr-2" />
              <span className="text-[10px] sm:text-sm font-medium text-gray-700 mt-0.5 sm:mt-0">End</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#1976D2] rounded-full sm:mr-2 animate-pulse" />
              <span className="text-[10px] sm:text-sm font-medium text-gray-700 mt-0.5 sm:mt-0">Current</span>
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm 
            flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 
                border-t-transparent mx-auto" />
              <p className="mt-4 text-lg font-medium text-gray-900">Loading map...</p>
              <p className="mt-2 text-sm text-gray-600">Please wait while we fetch the latest information</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm 
            flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto text-center">
              <div className="w-16 h-16 mx-auto text-red-500">
                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Something went wrong</h3>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryMap; 