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
  el.className = 'custom-marker';
  
  // Xác định màu dựa vào vị trí
  const backgroundColor = isFirst ? '#22C55E' :  // Xanh lá tươi hơn
                         isLast ? '#EF4444' :    // Đỏ tươi hơn
                         '#3B82F6';              // Xanh dương tươi hơn

  // Container cho marker
  const markerContainer = document.createElement('div');
  markerContainer.className = 'marker-container';
  
  // Marker chính
  const markerDot = document.createElement('div');
  markerDot.className = 'marker-dot';
  
  // Số thứ tự
  const markerLabel = document.createElement('div');
  markerLabel.className = 'marker-label';
  markerLabel.innerHTML = `${index}`;

  // Style cho container
  Object.assign(markerContainer.style, {
    position: 'relative',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)'
  });

  // Style cho dot
  Object.assign(markerDot.style, {
    position: 'absolute',
    bottom: '0',
    left: '50%',
    width: '14px',
    height: '14px',
    backgroundColor: backgroundColor,
    borderRadius: '50%',
    transform: 'translate(-50%, 50%)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    border: '2px solid white'
  });

  // Style cho label
  Object.assign(markerLabel.style, {
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translate(-50%, 0)',
    backgroundColor: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: backgroundColor,
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    border: '2px solid ' + backgroundColor,
    transition: 'all 0.2s ease'
  });

  // Thêm hover effect
  markerContainer.onmouseenter = () => {
    markerLabel.style.transform = 'translate(-50%, -2px)';
    markerLabel.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  };
  markerContainer.onmouseleave = () => {
    markerLabel.style.transform = 'translate(-50%, 0)';
    markerLabel.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
  };

  // Ghép các phần tử lại
  markerContainer.appendChild(markerDot);
  markerContainer.appendChild(markerLabel);
  el.appendChild(markerContainer);

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
  const [showSidebar, setShowSidebar] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
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

  // Thêm useEffect để resize map khi sidebar thay đổi
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.resize();
      }, 300); // Đợi animation sidebar hoàn tất
    }
  }, [showSidebar]);

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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Responsive Header */}
      <div className="bg-white shadow-md">
        <div className="w-full">
          <div className="flex items-center justify-between pl-4 pr-3 sm:pr-4 py-2 sm:py-3">
            {/* Left side with back button and route info */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 sm:p-2.5 text-gray-700 hover:text-blue-600 
                  bg-gray-100 hover:bg-blue-50 rounded-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Back to routes page"
              >
                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 flex items-center truncate">
                    <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-600 flex-shrink-0" />
                    <span className="truncate">Route Details</span>
                  </h1>
                  {route && (
                    <div className="flex items-center bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-100">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#00FF00] rounded-full animate-pulse 
                        shadow-[0_0_8px_rgba(0,255,0,0.5)]" />
                      <div className="ml-1.5 sm:ml-2 flex items-baseline">
                        <span className="text-sm sm:text-base font-bold text-gray-800">
                          {Math.ceil(route.distance)}
                        </span>
                        <span className="ml-0.5 text-xs sm:text-sm font-medium text-gray-600">km</span>
                      </div>
                    </div>
                  )}
                </div>
                {route && (
                  <div className="mt-0.5 flex items-center text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Code:</span>
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                      {route.route_code}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side with theme toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-700 hover:text-blue-600 
                  bg-gray-100 hover:bg-blue-50 rounded-lg transition-all duration-200"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Full screen on mobile when open */}
        <div className={`${showSidebar ? 'w-full sm:w-96' : 'w-0'} 
          transition-all duration-300 ease-in-out flex-shrink-0
          fixed sm:relative inset-0 sm:inset-auto pt-[57px] sm:pt-0
          bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 shadow-lg z-20`}>
          <div className={`h-full flex flex-col ${showSidebar ? 'w-full sm:w-96' : 'w-0'} overflow-hidden`}>
            {/* Sidebar Header */}
            <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
                  <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-white" />
                  Route Details
                </h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 sm:p-2.5 hover:bg-white/20 rounded-lg
                    transition-colors duration-200"
                  aria-label="Close sidebar"
                >
                  <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
              {route && (
                <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                  <div className="flex items-center text-xs sm:text-sm text-white">
                    <FiPackage className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Route Code: <span className="ml-1 font-medium bg-white/20 px-1.5 sm:px-2 py-0.5 rounded">{route.route_code}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-white">
                    <FiClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Total Distance: <span className="ml-1 font-medium bg-white/20 px-1.5 sm:px-2 py-0.5 rounded">{Math.ceil(route.distance)} km</span>
                  </div>
                </div>
              )}
            </div>

            {/* Marker Information - Optimized for touch */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar">
              {route?.shops.map((shop, index) => {
                const isFirst = index === 0;
                const isLast = index === route.shops.length - 1;
                return (
                  <div
                    key={shop.shop_details._id}
                    className={`bg-white/20 backdrop-blur-sm rounded-xl
                      border transition-all duration-200 active:scale-[0.98]
                      hover:bg-white/30 ${
                        selectedMarker === index
                          ? 'border-white shadow-lg scale-[1.02]'
                          : 'border-white/30'
                      }`}
                    onClick={() => {
                      setSelectedMarker(index);
                      mapRef.current?.flyTo({
                        center: [shop.shop_details.longitude, shop.shop_details.latitude],
                        zoom: 15,
                        duration: 1500
                      });
                      // Close sidebar on mobile after selection
                      if (window.innerWidth < 640) {
                        setShowSidebar(false);
                      }
                    }}
                  >
                    <div className="p-4">
                      {/* Marker Header */}
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                          bg-white font-bold shadow-lg ${
                            isFirst ? 'text-green-600' : isLast ? 'text-red-600' : 'text-blue-600'
                          }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white bg-white/20 px-2 py-0.5 rounded-md inline-block">
                            {isFirst ? 'Starting Point' : isLast ? 'Destination' : 'Waypoint'}
                          </h3>
                          <p className="text-sm text-white mt-1">
                            {shop.shop_details.shop_name}
                          </p>
                        </div>
                      </div>

                      {/* Marker Details */}
                      <div className="mt-4 space-y-3 bg-white/10 rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <FiMapPin className="w-4 h-4 text-white" />
                          </div>
                          <div className="ml-2 flex-1">
                            <div className="text-sm text-white/90 font-medium">
                              Delivery Location:
                            </div>
                            <div className="mt-0.5 text-sm text-white leading-relaxed">
                              {shop.shop_details.address}
                            </div>
                            {shop.shop_details.phone && (
                              <div className="mt-2 flex items-center text-sm text-white/90">
                                <svg className="w-4 h-4 text-white/80 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="font-medium">Contact: {shop.shop_details.phone}</span>
                              </div>
                            )}
                            {shop.shop_details.note && (
                              <div className="mt-2 flex items-start text-sm text-white/90">
                                <svg className="w-4 h-4 text-white/80 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Note: {shop.shop_details.note}</span>
                              </div>
                            )}
                            {isFirst && (
                              <div className="mt-2 flex items-center text-sm text-white/90">
                                <svg className="w-4 h-4 text-white/80 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <span>Pickup Location</span>
                              </div>
                            )}
                            {isLast && (
                              <div className="mt-2 flex items-center text-sm text-white/90">
                                <svg className="w-4 h-4 text-white/80 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                <span>Delivery Location</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="absolute inset-0 transition-all duration-300"
            style={{ filter: isDarkMode ? 'brightness(0.8)' : 'none' }} />

          {/* Toggle Sidebar Button - Enhanced for mobile */}
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="absolute top-4 left-4 z-30 bg-blue-600 text-white
                shadow-lg p-3 hover:bg-blue-700 transition-all duration-300 transform 
                hover:scale-105 rounded-lg active:scale-95"
              aria-label="Show sidebar"
            >
              <FiList className="w-6 h-6" />
            </button>
          )}

          {/* Map Controls - Repositioned for better mobile access */}
          <div className="absolute bottom-24 sm:top-4 right-4 flex flex-col items-end space-y-3 z-30">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 
                hover:bg-blue-50 transition-all duration-300 active:scale-95"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Zoom Controls */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1.5 flex flex-col space-y-1">
              <button
                onClick={() => mapRef.current?.zoomIn()}
                className="w-8 h-8 flex items-center justify-center text-gray-700 
                  hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors
                  active:scale-95"
                aria-label="Zoom in"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={() => mapRef.current?.zoomOut()}
                className="w-8 h-8 flex items-center justify-center text-gray-700 
                  hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors
                  active:scale-95"
                aria-label="Zoom out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Legend - Enhanced */}
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 
            bg-white/90 backdrop-blur-sm rounded-full shadow-lg py-2 px-4 
            border border-gray-100/50 z-30">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#22C55E] rounded-full" />
                <span className="text-xs font-medium text-gray-700">Start</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#3B82F6] rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-700">Current</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#EF4444] rounded-full" />
                <span className="text-xs font-medium text-gray-700">End</span>
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

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          @media (max-width: 640px) {
            .custom-scrollbar::-webkit-scrollbar {
              width: 0px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DeliveryMap; 