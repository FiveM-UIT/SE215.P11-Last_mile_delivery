import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockService } from '../services/mockService';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiNavigation2, FiPackage, FiClock, FiPhone } from 'react-icons/fi';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpZW5nIiwiYSI6ImNtNTkwY3R4ZDNybHUyanNmM2hoaDAxa2oifQ.ZUcv_MrKBuTc2lZ2jyofmQ';

const mapStyles = {
  wrapper: "h-screen flex flex-col",
  header: "bg-white shadow-sm p-4",
  mapContainer: "flex-1 relative",
  map: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
};

const CustomerMap = () => {
  const { routeCode } = useParams();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const markerRef = useRef(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const animationRef = useRef(null);
  const animationStartRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const [isCardCollapsed, setIsCardCollapsed] = useState(false);
  const [showDriverInfo, setShowDriverInfo] = useState(false);
  const driverCardRef = useRef(null);

  useEffect(() => {
    fetchRouteDetails();
  }, [routeCode]);

  const fetchRouteDetails = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await mockService.getCustomerRoute(routeCode);
      if (response.success) {
        setRoute(response.data);
        initializeMap(response.data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load route details. Please try again later.');
      toast.error('Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  const createIntermediatePoints = (coordinates, numPoints = 10) => {
    let interpolatedPoints = [];
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];
      
      // Tạo line string từ 2 điểm
      const line = turf.lineString([start, end]);
      const lineLength = turf.length(line, { units: 'kilometers' });
      
      // Tạo các điểm dừng dọc đường
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
      setCurrentPointIndex(0);
      return;
    }

    const currentPoint = routeCoordinates[currentPointIndex];
    const nextPoint = routeCoordinates[currentPointIndex + 1];

    if (markerRef.current && currentPoint && nextPoint) {
      // Tính toán vị trí trung gian để animation mượt hơn
      const start = turf.point(currentPoint);
      const end = turf.point(nextPoint);
      const bearing = turf.bearing(start, end);
      
      // Tạo animation mượt mà với requestAnimationFrame
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
          
          // Cập nhật vị trí popup nếu đang mở
          if (isPopupOpen && popupRef.current) {
            popupRef.current.setLngLat(newCoords);
          }

          // Chỉ xoay nội dung bên trong marker
          const markerEl = markerRef.current.getElement();
          const markerContent = markerEl.querySelector('.marker-content');
          if (markerContent) {
            markerContent.style.transform = `rotate(${bearing}deg)`;
          }
          
          requestAnimationFrame(animate);
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
      animationRef.current = setInterval(animateMarker, 1000); // 1 second per segment

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [routeCoordinates, currentPointIndex]);

  const initializeMap = (routeData) => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [routeData.current_location.longitude, routeData.current_location.latitude],
        zoom: 14
      });

      // Thêm event listener cho map để đóng popup khi click ra ngoài
      map.current.on('click', () => {
        if (isPopupOpen && popupRef.current) {
          popupRef.current.remove();
          setIsPopupOpen(false);
        }
      });

      // Tạo marker cho xe tải
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

      // Thêm event listener cho marker và ngăn chặn event bubbling
      el.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn event click lan tỏa tới map
        if (!isPopupOpen) {
          const coordinates = markerRef.current.getLngLat();
          popupRef.current.setLngLat(coordinates).addTo(map.current);
          setIsPopupOpen(true);

          // Thêm event listener cho map khi popup mở
          const closePopupOnMapClick = (e) => {
            // Kiểm tra xem click có phải trên popup không
            const popupElement = document.querySelector('.mapboxgl-popup');
            if (popupElement && !popupElement.contains(e.originalEvent.target)) {
              popupRef.current.remove();
              setIsPopupOpen(false);
              // Xóa event listener sau khi đóng popup
              map.current.off('click', closePopupOnMapClick);
            }
          };

          // Thêm event listener mới cho map
          map.current.on('click', closePopupOnMapClick);
        } else {
          popupRef.current.remove();
          setIsPopupOpen(false);
        }
      });

      // Tạo marker
      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat([routeData.current_location.longitude, routeData.current_location.latitude])
        .addTo(map.current);

      // Tạo popup
      popupRef.current = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        className: 'custom-popup',
        maxWidth: '300px',
        offset: [0, -15] // Thêm offset để popup không bị che marker
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

      // Thêm event listeners cho popup
      popupRef.current.on('close', () => {
        setIsPopupOpen(false);
        // Xóa event listener khi popup đóng
        if (map.current) {
          map.current.off('click');
        }
      });

      // Thay đổi phần vẽ route
      map.current.on('load', async () => {
        // Thêm markers cho điểm đầu và điểm cuối trước
        routeData.shops.forEach((shop, index) => {
          const isFirstStop = index === 0;
          const isLastStop = index === routeData.shops.length - 1;
          
          // Chỉ tạo marker cho điểm đầu và điểm cuối
          if (isFirstStop || isLastStop) {
            const el = document.createElement('div');
            el.className = 'marker';
            
            // Style cho marker
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
                <p class="text-sm">${shop.shop_name}</p>
              </div>
            `);

            // Thêm marker vào map
            new mapboxgl.Marker(el)
              .setLngLat([shop.longitude, shop.latitude])
              .setPopup(popup)
              .addTo(map.current);
          }
        });

        // Sau đó tạo và vẽ route
        const coordinates = routeData.shops.map(shop => 
          `${shop.longitude},${shop.latitude}`
        ).join(';');

        try {
          const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
            { method: 'GET' }
          );
          const json = await query.json();
          
          const data = json.routes[0];
          const route = data.geometry.coordinates;

          // Tạo các điểm dừng chi tiết hơn
          const detailedRoute = createIntermediatePoints(route);
          setRouteCoordinates(detailedRoute);
          
          // Thêm source và layer cho route
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route
              }
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#2563EB',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });

          // Fit bounds to show entire route
          const bounds = new mapboxgl.LngLatBounds();
          route.forEach(point => bounds.extend(point));
          map.current.fitBounds(bounds, {
            padding: 50
          });

        } catch (error) {
          console.error('Error:', error);
          toast.error('Failed to load route directions');
        }
      });
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      if (popupRef.current) {
        popupRef.current.remove();
      }
    };
  }, []);

  // Thêm useEffect để handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (driverCardRef.current && !driverCardRef.current.contains(event.target)) {
        setShowDriverInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                aria-label="Back to tracking page"
              >
                <FiArrowLeft className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline font-medium">Back</span>
              </button>
              
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                  <span className="hidden sm:inline">Tracking Details</span>
                  <span className="sm:hidden">Tracking</span>
                </h1>
                <div className="mt-0.5 flex items-center text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Route:</span>
                  <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 
                    bg-blue-100 text-blue-800 rounded-md">
                    {routeCode}
                  </span>
                </div>
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
                    <span>ETA: {route.estimated_time || 'Calculating...'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Controls and Driver Info */}
        <div className="absolute top-2 right-2 flex flex-col items-end space-y-2 z-10">
          {/* Zoom Controls */}
          <div className="bg-white rounded-lg shadow-lg p-1 flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-1">
            <button
              onClick={() => map.current.zoomIn()}
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
              onClick={() => map.current.zoomOut()}
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

          {/* Driver Info Button and Card */}
          {route && (
            <div className="relative" ref={driverCardRef}>
              {/* Floating Button */}
              <button
                onClick={() => setShowDriverInfo(!showDriverInfo)}
                className="relative w-10 h-10 rounded-full bg-white shadow-lg 
                  flex items-center justify-center hover:shadow-xl transition-shadow
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Show driver information"
              >
                <div className="relative">
                  <img
                    src={route.delivery_staff_id.avatar}
                    alt={route.delivery_staff_id.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 
                    bg-green-500 rounded-full border-2 border-white" />
                </div>
              </button>

              {/* Popup Card */}
              {showDriverInfo && (
                <div className="absolute top-12 right-0 w-72 sm:w-80 bg-white rounded-lg 
                  shadow-xl border border-gray-100 transform transition-all duration-200 
                  ease-out origin-top-right"
                >
                  <div className="p-4">
                    {/* Driver Info Header */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            src={route.delivery_staff_id.avatar}
                            alt={route.delivery_staff_id.fullName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 
                            bg-green-500 rounded-full border-2 border-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {route.delivery_staff_id.fullName}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 flex items-center">
                          <FiPhone className="w-4 h-4 mr-1" />
                          {route.delivery_staff_id.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDriverInfo(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Delivery Info */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-md">
                          Delivering
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Distance</span>
                        <span className="text-sm font-medium text-gray-900">
                          {(route.distance || 0).toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">ETA</span>
                        <span className="text-sm font-medium text-gray-900">
                          {route.estimated_time || 'Calculating...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Optimized Mobile Legend */}
        <div className="fixed bottom-2 left-2 right-2 sm:left-1/2 sm:right-auto 
          sm:transform sm:-translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg 
          shadow-lg p-2 sm:p-4 border border-gray-100/50 z-10">
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#10B981] rounded-full sm:mr-2" />
              <span className="text-[10px] sm:text-sm font-medium text-gray-700 mt-0.5 sm:mt-0">Start</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#EF4444] rounded-full sm:mr-2" />
              <span className="text-[10px] sm:text-sm font-medium text-gray-700 mt-0.5 sm:mt-0">End</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full sm:mr-2 animate-pulse" />
              <span className="text-[10px] sm:text-sm font-medium text-gray-700 mt-0.5 sm:mt-0">Current</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Loading & Error States */}
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
  );
};

export default CustomerMap; 