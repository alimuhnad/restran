angular.module('main')
    .controller('OrderCtrl', function (Order, Restaurant, $scope, $rootScope, $mdDialog, $interval, $mdToast, Auth) {

        $scope.rowOptions = [5, 10, 25];
        $scope.restaurants = [];
        $scope.orders = [];

        $scope.query = {
            search: '',
            status: '',
            orderType: '',
            date: null,
            limit: 5,
            page: 1,
            total: 0,
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
                $scope.promise = Order.all($scope.query).then(function (orders) {
                    $scope.orders = orders;
                    $scope.total = orders.reduce(function (total, order) {
                      return total + order.total;
                    }, 0);
                });
            });
        };

        $scope.onCountTable = function () {

            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Order.count($scope.query).then(function (total) {
                    $scope.query.total = total;
                });

            });
        };

        $scope.onLoadRestaurants = function () {
          Auth.ensureLoggedIn().then(function () {
            $scope.promise = Restaurant.all().then(function (restaurants) {
              $scope.restaurants = restaurants;
            });
          });
        }

        $scope.onRefreshTable();
        $scope.onCountTable();
        $scope.onLoadRestaurants();

        $interval(function() {
          Auth.ensureLoggedIn().then(function () {
            $scope.onRefreshTable();
            $scope.onCountTable();
          });
        }, 30000);

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

        $scope.onViewOrder = function (event, obj) {

            $mdDialog.show({
                controller: 'DialogViewOrderController',
                scope: $scope.$new(),
                templateUrl: '/views/partials/order.html',
                parent: angular.element(document.body),
                locals: {
                    "objOrder": obj
                },
                clickOutsideToClose: false

            });

        };

        $scope.onChangeStatus = function (order, status) {
          
          var confirm = $mdDialog.confirm().title('Update order #' + order.numberOrder)
            .textContent('Are you sure you want to change status to: ' + status + '?')
            .ariaLabel('Change status')
            .ok('Yes')
            .cancel('No');
            
          $mdDialog.show(confirm).then(function () {
            
            order.statusOrder = status;
            order.save().then(function () {
              showSimpleToast('Status updated');
              $scope.onRefreshTable();
              $scope.onCountTable();
            }, function (error) {
              showSimpleToast('Can\'t update status');
             });
          });

        };

        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

    }).controller('DialogViewOrderController', function (Order, $scope, $filter, $mdDialog,
        $mdToast, objOrder) {

        $scope.order = objOrder;
        $scope.orderCreatedAt = $filter('date')(objOrder.createdAt, 'yyyy-MM-dd HH:mm');

        $scope.onCancel = function () {
            $mdDialog.cancel();
        };

    });