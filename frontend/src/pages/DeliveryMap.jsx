import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockService } from '../services/mockService';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiList, FiX, FiMapPin, FiClock } from 'react-icons/fi';
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
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Back"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          {route && (
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {route.route_code}
              </h1>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                <FiMapPin className="w-4 h-4 mr-1" />
                <span>{route.distance.toFixed(2)} km</span>
                <span className="mx-2">•</span>
                <FiClock className="w-4 h-4 mr-1" />
                <span>~{Math.ceil(route.distance * 3)} phút</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          {/* Sidebar Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Toggle stops list"
          >
            {showSidebar ? 
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : 
              <FiList className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            }
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Sidebar - Desktop */}
        <div className="hidden md:block w-96 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto transition-colors">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Điểm dừng ({route?.shops?.length || 0})
            </h2>
            <div className="space-y-3">
              {route?.shops?.map((shop, index) => (
                <StopCard 
                  key={shop.shop_details.shop_id}
                  shop={shop}
                  index={index}
                  total={route.shops.length}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div ref={mapContainerRef} className="flex-1" />

        {/* Sidebar - Mobile */}
        {showSidebar && (
          <div className="absolute inset-0 z-20 md:hidden">
            <div className="h-full bg-white overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Điểm dừng ({route?.shops?.length || 0})
                  </h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FiX className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="space-y-3">
                  {route?.shops?.map((shop, index) => (
                    <StopCard 
                      key={shop.shop_details.shop_id}
                      shop={shop}
                      index={index}
                      total={route.shops.length}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading & Error States */}
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white bg-opacity-75">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
              <div className="text-red-500 text-center">
                <p className="mb-4">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryMap; 