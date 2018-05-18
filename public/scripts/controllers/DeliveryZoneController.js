angular.module('main')
    .controller('DeliveryZoneCtrl', function (DeliveryZone, $scope,
        $rootScope, $mdDialog, $mdToast, Auth) {


        $scope.rowOptions = [5, 10, 25];
        $scope.deliveryZones = [];

        $scope.query = {
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
                $scope.promise = DeliveryZone.all($scope.query).then(function (deliveryZones) {
                    $scope.deliveryZones = deliveryZones;
                });

            });
        };

        $scope.onCountTable = function () {

            Auth.ensureLoggedIn().then(function () {
                $scope.promise = DeliveryZone.count($scope.query).then(function (total) {
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
                $scope.promise = DeliveryZone.all($scope.query).then(function (deliveryZones) {
                    $scope.deliveryZones = deliveryZones;
                });
            });

        };

        $scope.onPaginationChange = function (page, limit) {
            $scope.query.page = page;
            $scope.query.limit = limit;
            $scope.onRefreshTable();
        };

        $scope.onNewEditDeliveryZone = function (event, obj) {

            $mdDialog.show({
                controller: 'DialogDeliveryZoneController',
                scope: $scope.$new(),
                templateUrl: '/views/partials/deliveryzone.html',
                parent: angular.element(document.body),
                locals: {
                    "objDeliveryZone": obj
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

        $scope.onViewDeliveryZone = function (event, obj) {

            $mdDialog.show({
                controller: 'DialogViewDeliveryZoneController',
                scope: $scope.$new(),
                templateUrl: '/views/partials/deliveryzone.html',
                parent: angular.element(document.body),
                locals: {
                    "objDeliveryZone": obj
                },
                clickOutsideToClose: false

            })
                .then(function (response) { }, function () {
                    //'You cancelled the dialog.';
                });

        };

        $scope.onChangeStatusDelivery = function (delivery, status) {

            delivery.isActive = status;
            DeliveryZone.save(delivery).then(function (data) {
                showSimpleToast('Saved');
                $scope.onRefreshTable();
                $scope.onCountTable();
            }, function (error) { });

        };

        $scope.onDeleteDeliveryZone = function (delivery) {

            DeliveryZone.delete(delivery).then(function () {
                showSimpleToast('Deleted');
                $scope.onRefreshTable();
                $scope.onCountTable();
            }, function (error) {
                console.log(error);
            });
        }

        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        }

    }).controller('DialogDeliveryZoneController', function (DeliveryZone, Restaurant, $scope, $mdDialog,
        $mdToast, objDeliveryZone) {

        $scope.ActiveAction = true;

        //////////////////////////////////////////////////////////
        /**
         * Field for autocomplete
         */
        $scope.selectedDeliveryZoneCategory = null;
        $scope.searchTextDeliveryZoneCategory = null;
        $scope.listDeliveryZoneCategory = [];

        if (Object.keys(objDeliveryZone).length == 0) {
            $scope.typeAction = 'new';
            $scope.deliveryZone = DeliveryZone.new();
            $scope.deliveryZone.isActive = true;
            $scope.deliveryZone.fee = 0;
        } else {
            $scope.typeAction = 'edit';
            $scope.deliveryZone = objDeliveryZone;
            // $scope.selectedDeliveryZoneCategory = $scope.deliveryZone.restaurant.attributes;
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

                // $scope.deliveryZone.restaurant = {
                //     __type: "Pointer",
                //     className: $scope.selectedDeliveryZoneCategory.className,
                //     objectId: $scope.selectedDeliveryZoneCategory.id
                // };

                $scope.deliveryZone.canonical = $scope.setCanonical($scope.deliveryZone);

                DeliveryZone.save($scope.deliveryZone).then(function () {
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

        $scope.setCanonical = function (objDelivery) {

            var canonical = angular.lowercase(objDelivery.name + ' ' +
                objDelivery.description + ' ' +
                objDelivery.fee);

            return canonical;

        };

        ///////////////////////////////////////////////

        $scope.getMatchesItemCategory = function (query) {
            if (query.length > 2) {
                Restaurant.searchAutocomplete({
                    'search': query
                }).then(function (results) {
                    console.log(results);
                    if (results.length > 0) {
                        $scope.listDeliveryZoneCategory = results;
                    }
                });
            }
        }

        ////////////////////////////////////////////////////

    }).controller('DialogViewDeliveryZoneController', function (DeliveryZone, $scope, $mdDialog,
        $mdToast, objDeliveryZone) {

        $scope.ActiveAction = false;
        $scope.typeAction = 'view';
        $scope.deliveryZone = objDeliveryZone;

        $scope.onCancel = function () {
            $mdDialog.cancel();
        };

    })