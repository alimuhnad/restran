angular.module('main')
    .controller('ItemCtrl', function (Item, ItemCategory, Restaurant, $scope, $rootScope,
        $mdDialog, $mdToast, Auth) {

        var X = XLSX;
        $scope.showProgressImport = false;
        $scope.onLoadCss = function () {
            $scope.currentNavItem = 'page1';
            var capaPrincipal = document.getElementById("capaPrincipal");
            capaPrincipal.style.padding = "0px";

            var capaSubPrincipal = document.getElementById("capaSubPrincipal");
            capaSubPrincipal.style.padding = "0px";
        }

        $scope.onLoadCss();

        $scope.items = [];
        $scope.rowOptions = [5, 10, 25];
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
                $scope.promise = Item.all($scope.query).then(function (items) {
                    $scope.items = items;
                });

            });
        };

        $scope.onCountTable = function () {

            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Item.count($scope.query).then(function (total) {
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

        $scope.logOrderItem = function (order) {

            var getOrder = order.indexOf("-");
            var gerTable = getOrder == -1 ? order : order.slice(1, order.length);
            $scope.query.orderby = getOrder == -1 ? "asc" : "desc";
            $scope.query.orderbytable = gerTable;

            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Item.all($scope.query).then(function (items) {
                    $scope.items = items;
                });
            });

        };

        $scope.onPaginationChange = function (page, limit) {
            $scope.query.page = page;
            $scope.query.limit = limit;
            $scope.onRefreshTable();
        };

        $scope.onNewEditItem = function (event, obj) {

            $mdDialog.show({
                controller: 'DialogItemController',
                scope: $scope.$new(),
                templateUrl: '/views/partials/item.html',
                parent: angular.element(document.body),
                locals: {
                    objItem: obj
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
                });

        };

        $scope.onViewItem = function (event, obj) {

            $mdDialog.show({
                controller: 'DialogItemViewController',
                scope: $scope.$new(),
                templateUrl: '/views/partials/item.html',
                parent: angular.element(document.body),
                locals: {
                    "objItem": obj
                },
                clickOutsideToClose: false

            });
        };

        $scope.onChangeStatusItem = function (item, status) {

            item.isActive = status;
            Item.save(item).then(function (data) {
                showSimpleToast('Saved');
                $scope.onRefreshTable();
                $scope.onCountTable();
            }, function (error) { });

        };

        $scope.onDeleteItem = function (item) {

            var confirm = $mdDialog.confirm()
                .title('Delete')
                .textContent('Are you sure you want to delete the item: ' + item.name)
                .ariaLabel('Lucky day')
                .ok('Accept')
                .cancel('Reject');
            $mdDialog.show(confirm).then(function () {

                item.isActive = status;
                Item.delete(item).then(function (data) {
                    showSimpleToast('Deleted');
                    $scope.onRefreshTable();
                    $scope.onCountTable();
                }, function (error) {
                    console.log(error);
                });

            });

        };

        $scope.read = function (workbook) {
            $scope.showProgressImport = true;
            var result = {};
            workbook.SheetNames.forEach(function (sheetName) {
                var roa = X.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                if (roa.length > 0) {
                    result[sheetName] = roa;
                }
            });

            //ONLY TAKE THE SHEET ONE FOR TO IMPORT

            var items = result.Sheet1;
            var allItems = [];

            for (var c = 0; c < items.length; c++) {

                var item = Item.new();
                item.description = items[c].description || undefined;
                item.discountedPrice = Number(items[c].discountedPrice) || undefined;
                item.isActive = Number(items[c].isActive) == 1 ? true : false || undefined;
                item.itemCategory = { "__type": "Pointer", "className": "ItemCategory", "objectId": items[c].itemCategory } || undefined;
                item.itemId = items[c].itemId || undefined;
                item.name = items[c].name || undefined;
                item.price = Number(items[c].price) || undefined;
                item.canonical = (item.description + ' ' + item.discountedPrice + ' ' + item.itemId + ' ' +
                    item.name + ' ' + item.price).toLowerCase();

                allItems.push(item);
            }

            $scope.saveImportItems(allItems);

        };

        $scope.error = function (e) {
            showSimpleToast('Importation no complete');
        };

        $scope.saveImportItems = function (items) {

            Item.saveAll(items).then(function (response) {
                $scope.showProgressImport = false;
                $scope.onReload();
                showSimpleToast('Importation complete');
            });
        };

        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.rowOptionsItemCategory = [5, 10, 25];
        $scope.itemCategorys = [];
        $scope.ArrayRestaurante = [];
        $scope.restaurants = [];

        $scope.queryItemCategory = {
            search: '',
            limit: 5,
            page: 1,
            total: 0,
        };

        $scope.category = null;

        $scope.onRefreshTableItemCategory = function () {
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = ItemCategory.all($scope.queryItemCategory).then(function (itemCategorys) {
                    $scope.itemCategorys = itemCategorys;
                });

            });
        };

        $scope.onCountTableItemCategory = function () {
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = ItemCategory.count($scope.queryItemCategory).then(function (itemCategorys) {
                    $scope.queryItemCategory.total = itemCategorys;
                });

            });
        };

        $scope.onRefreshTableItemCategory();
        $scope.onCountTableItemCategory();

        $scope.logOrder = function (order) {

            var getOrder = order.indexOf("-");
            var gerTable = getOrder == -1 ? order : order.slice(1, order.length);
            $scope.queryItemCategory.orderby = getOrder == -1 ? "asc" : "desc";
            $scope.queryItemCategory.orderbytable = gerTable;

            Auth.ensureLoggedIn().then(function () {
                $scope.promise = ItemCategory.all($scope.queryItemCategory).then(function (itemCategorys) {
                    $scope.itemCategorys = itemCategorys;
                });
            });

        };

        $scope.onPaginationChangeItemCategory = function (page, limit) {
            $scope.queryItemCategory.page = page;
            $scope.queryItemCategory.limit = limit;
            $scope.onRefreshTableItemCategory();
        };

        $scope.onSubmitAddCategory = function (valid) {
            if (valid) {

                $scope.itemCategory = ItemCategory.new();
                $scope.itemCategory.name = $scope.category;
                $scope.itemCategory.canonical = $scope.category;
                $scope.itemCategory.isActive = true;

                ItemCategory.save($scope.itemCategory).then(function (itemCategory) {
                    $scope.onRefreshTableItemCategory();
                    $scope.onCountTableItemCategory();
                    $scope.category = "";
                });

            }
        };

        $scope.onSelect = function (item) {
            $scope.selected.length = 0;
            $scope.selected.push(item);
        };

        $scope.onReloadItemCategory = function () {

            $scope.queryItemCategory.page = 1;
            $scope.onRefreshTableItemCategory();
            $scope.onCountTableItemCategory();

        }

        $scope.onEditCategory = function (itemCategory) {

            $mdDialog.show({
                controller: 'DialogItemCategoryController',
                scope: $scope.$new(),
                templateUrl: '/views/partials/itemCategory.html',
                parent: angular.element(document.body),
                locals: {
                    "objItemCategory": itemCategory
                },
                clickOutsideToClose: false

            })
                .then(function (response) {

                    if (response != undefined) {
                        $scope.onRefreshTableItemCategory();
                        $scope.onCountTableItemCategory();
                    }

                },
                function () {

                });
        };

        $scope.onChangeStatusItemCategory = function (itemCategory, status) {

            itemCategory.isActive = status;
            ItemCategory.save(itemCategory).then(function (data) {
                showSimpleToast('Saved');
                $scope.onRefreshTableItemCategory();
                $scope.onCountTableItemCategory();
            }, function (error) { });

        };

        $scope.onDeleteItemCategory = function (itemCategory) {
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .textContent('Are you sure you want to delete the item category : ' + itemCategory.name + '?')
                .ariaLabel('Lucky day')
                .ok('Accept')
                .cancel('Reject');
            $mdDialog.show(confirm).then(function () {

                ItemCategory.delete(itemCategory).then(function () {
                    showSimpleToast('Deleted');
                    $scope.onRefreshTableItemCategory();
                    $scope.onCountTableItemCategory();
                }, function (error) {
                    console.log(error);
                });

            }, function () {
                //Cancel
            });
        }


    }).controller('DialogItemController', function (Item, ItemCategory, Restaurant, File, $scope,
        $mdDialog, $mdToast, objItem) {

        $scope.ActiveAction = true;
        $scope.typeAction = '';
        $scope.isSavingDisabled = false;
        $scope.imageFilename = '';

        if (Object.keys(objItem).length == 0) {
            $scope.typeAction = 'new';
            $scope.item = Item.new();
            $scope.item.isActive = true;
            $scope.item.discountedPrice = 0;
        } else {
            $scope.typeAction = 'edit';
            $scope.item = objItem;

            if ($scope.item.photo) {
                $scope.imageFilename = $scope.item.photo.name();
            }
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

        $scope.uploadImage = function (file) {

            if (file === null || file.type.match(/image.*/) === null) {
                showSimpleToast('File not supported');
                return;
            } else {

                $scope.imageFilename = file.name;
                $scope.isUploadingItem = true;

                File.upload(file).then(function (savedFile) {
                    var getImg = savedFile._source.file;
                    $scope.item.photo = new Parse.File(getImg.name, getImg);
                    $scope.isUploadingItem = false;
                    showSimpleToast('File uploaded');
                }, function (error) {

                    showSimpleToast(error.message);
                    $scope.isUploadingItem = false;
                    $scope.item.photo = {};

                });
            }
        };

        $scope.OnLoadItemCategory = function () {
            ItemCategory.search().then(function (results) {
                $scope.listItemCategory = results;
            });
        };


        $scope.OnLoadItemCategory();

        $scope.onSubmit = function (valid) {

            $scope.isSavingDisabled = true;

            if (valid) {

                $scope.item.canonical = $scope.setCanonical($scope.item);


                Item.save($scope.item).then(function () {
                    $scope.isSavingDisabled = false;
                    $mdDialog.hide({
                        estatus: 'success'
                    });
                    showSimpleToast('Saved');
                }, function (error) {
                    $scope.isSavingDisabled = false;
                });

            } else {
                $scope.isSavingDisabled = false;
                showSimpleToast('Complete all form fields');
            }
        }

        $scope.setCanonical = function (objItem) {

            var nameCate = ($scope.selectItemCategoryName);

            var canonical = angular.lowercase(objItem.name + ' ' +
                objItem.itemId + ' ' +
                objItem.description + ' ' +
                nameCate + ' ' +
                objItem.price + ' ' +
                objItem.discountedPrice);

            return canonical;
        };

    }).controller('DialogItemViewController', function ($scope, $mdDialog, $mdToast, objItem) {


        $scope.ActiveAction = false;
        $scope.typeAction = 'view';
        $scope.item = objItem;
        $scope.imageFilename = $scope.item.photo._name;
        $scope.selectedItemCategory = $scope.item.itemCategory;

        $scope.onCancel = function () {
            $mdDialog.cancel();
        };

    }).controller('DialogItemCategoryController', function (ItemCategory, Restaurant, $scope,
        $mdDialog, $mdToast, objItemCategory) {

        $scope.typeAction = "";
        $scope.ArrayRestaurante = [];

        if (Object.keys(objItemCategory).length > 0) {
            $scope.typeAction = "Edit";
            $scope.itemCate = objItemCategory;

            if ($scope.itemCate.restaurant != undefined) {

                for (var re = 0; re < $scope.itemCate.restaurant.length; re++) {
                    $scope.ArrayRestaurante.push($scope.itemCate.restaurant[re].id)
                }
            }

        } else {
            $scope.typeAction = "New";
            $scope.itemCate = ItemCategory.new();
            $scope.itemCate.isActive = true;
        }

        $scope.OnLoadRestaurante = function () {

            Restaurant.all({ 'hasMenu': true }).then(function (restaurants) {
                $scope.restaurants = restaurants;
            });

        };

        $scope.OnLoadRestaurante();

        $scope.onCancel = function () {
            $mdDialog.cancel();
        }

        var showSimpleToast = function (message) {
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .action('OK')
                    .hideDelay(false)
            );
        };

        $scope.onSubmit = function (valid) {
            $scope.isSavingDisabled = true;
            if (valid) {
                var name = $scope.itemCate.name;
                $scope.itemCate.canonical = angular.lowercase(name);
                $scope.itemCate.restaurant = $scope.onArrayPointerRestaurants();
                ItemCategory.save($scope.itemCate).then(function () {
                    $mdDialog.hide({
                        'estatus': 'success'
                    });
                    showSimpleToast('Saved');
                    $scope.isSavingDisabled = false;
                })
            } else {
                $scope.isSavingDisabled = false;
                showSimpleToast('Complete all form fields');
            }
        };

        $scope.onArrayPointerRestaurants = function () {

            var restaurant = [];

            for (var c = 0; c < $scope.ArrayRestaurante.length; c++) {
                restaurant.push({
                    "__type": "Pointer",
                    "className": "Restaurant",
                    "objectId": $scope.ArrayRestaurante[c]
                });
            }

            return restaurant;

        };

    });