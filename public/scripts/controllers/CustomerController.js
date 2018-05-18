angular.module('main')
    .controller('CustomerCtrl', function (Customer, $scope,
        $rootScope, $mdDialog, $mdToast, Auth) {


        $scope.rowOptions = [5, 10, 25];
        $scope.restaurants = [];

        $scope.query = {
            search: '',
            limit: 5,
            page: 1,
            total: 0,
            search: ''
        };

        $scope.customers = [];

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
                $scope.promise = Customer.all($scope.query).then(function (customers) {
                    $scope.customers = customers;
                });

            });
        };

        $scope.onCountTable = function () {

            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Customer.count($scope.query).then(function (total) {
                    $scope.query.total = total;
                });

            });
        };

        $scope.onRefreshTable();
        $scope.onCountTable();

        $scope.onReload = function () {
            $scope.query.page = 1;
            $scope.onRefreshTable();
            $scope.onCountTable();
        };

        $scope.logOrder = function (order) {

            var getOrder = order.indexOf("-");
            var gerTable = getOrder == -1 ? order : order.slice(1, order.length);
            $scope.query.orderby = getOrder == -1 ? "asc" : "desc";
            $scope.query.orderbytable = gerTable;

            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Customer.all($scope.query).then(function (customers) {
                    $scope.customers = customers;
                });
            });

        };

        $scope.onPaginationChange = function (page, limit) {
            $scope.query.page = page;
            $scope.query.limit = limit;
            $scope.onRefreshTable();
        };

        $scope.onNewEditCustomer = function (event, obj) {

            $mdDialog.show({
                    controller: 'DialogCustomerController',
                    scope: $scope.$new(),
                    templateUrl: '/views/partials/customer.html',
                    parent: angular.element(document.body),
                    locals: {
                        "objCustomer": obj
                    },
                    clickOutsideToClose: false

                })
                .then(function (response) {
                    if (response != undefined) {
                        if (response.estatus == "success") {
                            $scope.onRefreshTable();
                            $scope.onCountTable();
                        }
                    }
                }, function () {
                    //'You cancelled the dialog.';
                });

        };

        $scope.onViewCustomer = function (event, obj) {

            $mdDialog.show({
                    controller: 'DialogCustomerViewController',
                    scope: $scope.$new(),
                    templateUrl: '/views/partials/customer.html',
                    parent: angular.element(document.body),
                    locals: {
                        "objCustomer": obj
                    },
                    clickOutsideToClose: false

                })
                .then(function (response) {}, function () {
                    //'You cancelled the dialog.';
                });

        };

        $scope.onChangeStatusRestaurant = function (customer, status) {

            var confirm = $mdDialog.confirm()
                .title('Change status')
                .textContent('¿you want establish the status ' +
                    (status == true ? 'active' : 'Inactive') + ' to ' + customer.name + ' ' + customer.lastName + '?')
                .ariaLabel('Lucky day')
                .ok('Accept')
                .cancel('Reject');
            $mdDialog.show(confirm).then(function () {

                customer.isActive = status;
                Customer.save(customer).then(function (data) {
                    showSimpleToast('Saved');
                    $scope.onRefreshTable();
                    $scope.onCountTable();
                }, function (error) {});

            }, function () {
                //Cancel
            });

        };

        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };


    }).controller('DialogCustomerController', function (Customer, $scope, $mdDialog,
        $mdToast, objCustomer) {

        $scope.ActiveAction = true;
        if (Object.keys(objCustomer).length == 0) {
            $scope.typeAction = 'new';
            $scope.customer = Customer.new();
        } else {
            $scope.typeAction = 'edit';
            $scope.customer = objCustomer;
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

        $scope.onSubmit = function (valid) {

            $scope.isSavingDisabled = true;

            if (valid) {

                $scope.customer.canonical = $scope.setCanonical($scope.customer);
                $scope.customer.isActive = true;

                Customer.save($scope.customer).then(function () {
                    $scope.isSavingDisabled = false;
                    $mdDialog.hide({
                        'estatus': 'success'
                    });
                    showSimpleToast('Saved');
                }, function (error) {
                    $scope.isSavingDisabled = false;
                });

            } else {
                $scope.isSavingDisabled = false;
                showSimpleToast('Complete all form fields');
            }

        };

        $scope.setCanonical = function (objCustomer) {
            var canonical = angular.lowercase(objCustomer.name + ' ' +
                objCustomer.lastName + ' ' +
                objCustomer.street + ' ' +
                objCustomer.locationName + ' ' +
                objCustomer.zipCode);

            return canonical;
        };

    }).controller('DialogCustomerViewController', function ($scope, $mdDialog,
        $mdToast, objCustomer) {

        $scope.ActiveAction = false;
        $scope.typeAction = 'view';
        $scope.customer = objCustomer;

        $scope.onCancel = function () {
            $mdDialog.cancel();
        };

    });