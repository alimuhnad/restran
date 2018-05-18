angular.module('main')
  .controller('RestaurantCtrl', function (Restaurant, $scope, $rootScope, $mdDialog, $mdToast, Auth) {

    $scope.rowOptions = [5, 10, 25];
    $scope.restaurants = [];

    $scope.query = {
      search: '',
      limit: 5,
      page: 1,
      total: 0,
      search: ''
    };

    var showSimpleToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
          .content(message)
          .action('OK')
          .hideDelay(false)
      );
    };

    $scope.onRefreshTable = function () {

      Auth.ensureLoggedIn().then(function () {
        $scope.promise = Restaurant.all($scope.query).then(function (restaurants) {
          $scope.restaurants = restaurants;
        });

      });
    }

    $scope.onCountTable = function () {

      Auth.ensureLoggedIn().then(function () {
        $scope.promise = Restaurant.count($scope.query).then(function (total) {
          $scope.query.total = total;
        });

      });
    }

    $scope.onRefreshTable();
    $scope.onCountTable();

    $scope.onReload = function () {
      $scope.query.page = 1;
      $scope.onRefreshTable();
      $scope.onCountTable();
    };

    $scope.onPaginationChange = function (page, limit) {
      $scope.query.page = page;
      $scope.query.limit = limit;
      $scope.onRefreshTable();
    };

    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    }

    $scope.onNewEditRestaurant = function (event, obj) {

      $mdDialog.show({
        controller: 'DialogRestaurantController',
        scope: $scope.$new(),
        templateUrl: '/views/partials/restaurant.html',
        parent: angular.element(document.body),
        locals: {
          objRestaurant: obj
        },
        clickOutsideToClose: false

      })
        .then(function () {
          $scope.onRefreshTable();
          $scope.onCountTable();
        });
    };

    $scope.onViewRestaurant = function (event, obj) {

      $mdDialog.show({
        controller: 'DialogViewRestaurantController',
        scope: $scope.$new(),
        templateUrl: '/views/partials/restaurant.html',
        parent: angular.element(document.body),
        locals: {
          objRestaurant: obj
        },
        clickOutsideToClose: false

      });

    };

    $scope.onDeleteRestaurant = function (restaurant) {
      var confirm = $mdDialog.confirm()
        .title('Delete')
        .textContent('Are you sure you want to delete this restaurant: ' + restaurant.name + '?')
        .ariaLabel('Delete restaurant')
        .ok('Accept')
        .cancel('Cancel');
      $mdDialog.show(confirm).then(function () {

        Restaurant.delete(restaurant).then(function () {
          showSimpleToast('Deleted');
          $scope.onRefreshTable();
          $scope.onCountTable();
        }, function (error) {
          console.log(error);
        });

      });
    };

    $scope.onChangeStatusRestaurant = function (restaurant, status) {

      restaurant.isActive = status;

      Restaurant.save(restaurant).then(function (data) {
        showSimpleToast('Saved');
        $scope.onRefreshTable();
        $scope.onCountTable();
      });

    };

  }).controller('DialogRestaurantController',
  function (Restaurant, DeliveryZone, TimeZone, File, $scope, $mdDialog, $mdToast, objRestaurant) {

    $scope.isSavingDisabled = false;
    $scope.imageFilename = '';
    $scope.input = {};
    $scope.listZone = [];
    $scope.searchTerm;
    $scope.phones = [''];

    var map;
    var marker;

    if (!objRestaurant) {
      $scope.restaurant = Restaurant.new();
      $scope.restaurant.isActive = true;
    } else {
      $scope.restaurant = objRestaurant;

      if ($scope.restaurant.phones && $scope.restaurant.phones.length) {
        $scope.phones = $scope.restaurant.phones;
      }

      $scope.imageFilename = $scope.restaurant.photo.name();
      $scope.input.latitude = $scope.restaurant.location.latitude;
      $scope.input.longitude = $scope.restaurant.location.longitude;
    }

    setTimeout(function () {

      var coords = { lat: 0, lng: 0 };

      map = new google.maps.Map(document.getElementById("map"), {
        center: coords,
        scrollwheel: false,
        zoom: 1,
        disableDefaultUI: false
      });

      marker = new google.maps.Marker({
        position: coords,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP
      });

      if (!$scope.restaurant.isNew()) {
        marker.setPosition(new google.maps.LatLng(
          $scope.restaurant.location.latitude,
          $scope.restaurant.location.longitude
        ));

        map.setCenter(new google.maps.LatLng(
          $scope.restaurant.location.latitude,
          $scope.restaurant.location.longitude
        ));

        map.setZoom(12);
      }

      google.maps.event.addListener(marker, 'dragend', function (event) {
        $scope.$apply(function () {
          $scope.input = {
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng()
          };

          $scope.restaurant.location = new Parse.GeoPoint({
            latitude: $scope.input.latitude,
            longitude: $scope.input.longitude
          });
        });
      });

    }, 1000)

    TimeZone.ListZones().then(function (data) {
      $scope.listZone = data;
    });


    $scope.hours = [
      { id: '0000', text: '00:00 AM' },
      { id: '0030', text: '00:30 AM' },
      { id: '0100', text: '01:00 AM' },
      { id: '0130', text: '01:30 AM' },
      { id: '0200', text: '02:00 AM' },
      { id: '0230', text: '02:30 AM' },
      { id: '0300', text: '03:00 AM' },
      { id: '0330', text: '03:30 AM' },
      { id: '0400', text: '04:00 AM' },
      { id: '0430', text: '04:30 AM' },
      { id: '0500', text: '05:00 AM' },
      { id: '0530', text: '05:30 AM' },
      { id: '0600', text: '06:00 AM' },
      { id: '0630', text: '06:30 AM' },
      { id: '0700', text: '07:00 AM' },
      { id: '0730', text: '07:30 AM' },
      { id: '0800', text: '08:00 AM' },
      { id: '0830', text: '08:30 AM' },
      { id: '0900', text: '09:00 AM' },
      { id: '0930', text: '09:30 AM' },
      { id: '1000', text: '10:00 AM' },
      { id: '1030', text: '10:30 AM' },
      { id: '1100', text: '11:00 AM' },
      { id: '1130', text: '11:30 AM' },
      { id: '1200', text: '12:00 PM' },
      { id: '1230', text: '12:30 PM' },
      { id: '1300', text: '13:00 PM' },
      { id: '1330', text: '13:30 PM' },
      { id: '1400', text: '14:00 PM' },
      { id: '1430', text: '14:30 PM' },
      { id: '1500', text: '15:00 PM' },
      { id: '1530', text: '15:30 PM' },
      { id: '1600', text: '16:00 PM' },
      { id: '1630', text: '16:30 PM' },
      { id: '1700', text: '17:00 PM' },
      { id: '1730', text: '17:30 PM' },
      { id: '1800', text: '18:00 PM' },
      { id: '1830', text: '18:30 PM' },
      { id: '1900', text: '19:00 PM' },
      { id: '1930', text: '19:30 PM' },
      { id: '2000', text: '20:00 PM' },
      { id: '2030', text: '20:30 PM' },
      { id: '2100', text: '21:00 PM' },
      { id: '2130', text: '21:30 PM' },
      { id: '2200', text: '22:00 PM' },
      { id: '2230', text: '22:30 PM' },
      { id: '2300', text: '23:00 PM' },
      { id: '2330', text: '23:30 PM' },
    ];

    var openingHours = [];

    for (var i = 1; i < 7; i++) {

      var openingHour = {
        open: null,
        close: null,
        day: i,
        isClosed: null
      }

      openingHours.push(openingHour);
    }

    openingHours.push({ open: null, close: null, day: 0, isClosed: null });

    if ($scope.restaurant.openingHours == undefined) {
      $scope.restaurant.openingHours = openingHours;
    }

    var showSimpleToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
          .content(message)
          .action('OK')
          .hideDelay(false)
      );
    };

    $scope.onCancel = function () {
      $mdDialog.cancel();
    };

    $scope.onAddPhone = function () {
      $scope.phones.push('');
    };

    $scope.onDeletePhone = function (phone) {
      
      var index = $scope.phones.indexOf(phone);

      if (index > -1) {
        $scope.phones.splice(index, 1);
      }
    };

    $scope.onLoadDeliveryZone = function () {
      DeliveryZone.search().then(function (results) {
        $scope.deliveryZones = results;
      });
    };

    $scope.onLoadDeliveryZone();

    $scope.uploadImage = function (file) {

      if (file === null || file.type.match(/image.*/) === null) {
        showSimpleToast('File not supported');
        return;
      } else {

        $scope.imageFilename = file.name;
        $scope.isUploading = true;

        File.upload(file).then(function (savedFile) {
          $scope.restaurant.photo = savedFile;
          $scope.isUploading = false;
          showSimpleToast('File uploaded');
        }, function (error) {
          showSimpleToast(error.message);
          $scope.isUploading = false;
        });
      }
    }

    $scope.onInputLocationChanged = function () {

      if ($scope.input.latitude && $scope.input.longitude) {
        $scope.restaurant.location = new Parse.GeoPoint({
          latitude: $scope.input.latitude,
          longitude: $scope.input.longitude
        });

        marker.setPosition(new google.maps.LatLng(
          $scope.input.latitude,
          $scope.input.longitude
        ));

        map.setCenter(new google.maps.LatLng(
          $scope.input.latitude,
          $scope.input.longitude
        ));
      }
    };

    $scope.setHourZone = function (timeZone) {
      $scope.restaurant.hourZone = timeZone.offset;
    };

    $scope.onSubmit = function (valid, form) {

      if (valid) {

        if (!$scope.restaurant.photo) {
          $scope.isSavingDisabled = false;
          return showSimpleToast('Please upload an image');
        }

        if (!$scope.restaurant.location) {
          $scope.isSavingDisabled = false;
          return showSimpleToast('Set the location on the map');
        }

        $scope.restaurant.phones = [];

        console.log($scope.phones);

        angular.forEach($scope.phones, function (phone) {
          if (phone) {
            $scope.restaurant.phones.push(phone);
          }
        });

        Restaurant.save($scope.restaurant).then(function (data) {
          $scope.isSavingDisabled = false;
          $mdDialog.hide();
          showSimpleToast('Saved');
        }, function (error) {
          $scope.isSavingDisabled = false;
          showSimpleToast(error.message);
        });

      } else {
        $scope.isSavingDisabled = false;
        showSimpleToast('Complete all form fields');
      }
    };

    $scope.getDayText = function (day) {
      if (day === 0) {
        return 'Sunday';
      } else if (day === 1) {
        return 'Monday';
      } else if (day === 2) {
        return 'Tuesday';
      } else if (day === 3) {
        return 'Wednesday';
      } else if (day === 4) {
        return 'Thursday';
      } else if (day === 5) {
        return 'Friday';
      } else if (day === 6) {
        return 'Saturday';
      }
    };

  });