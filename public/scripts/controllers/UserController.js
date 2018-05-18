angular.module('main')
  .controller('UserCtrl', function (User, $scope, $rootScope, $mdDialog, $mdToast, Auth) {

    // Pagination options.
    $scope.rowOptions = [5, 10, 25];

    $scope.query = {
      search: '',
      limit: 5,
      page: 1,
      total: 0
    }

    $scope.users = [];

    var showToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
          .content(message)
          .action('OK')
          .hideDelay(false)
      );
    };

    $scope.onRefreshTable = function () {

      Auth.ensureLoggedIn().then(function () {
        $scope.promise = User.all($scope.query).then(function (res) {
          $scope.users = res.users;
           $scope.query.total = res.total;
        });

      });
    };

    $scope.onRefreshTable();

    $scope.onReload = function () {
      $scope.query.page = 1;
      $scope.onRefreshTable();
    };

    $scope.logOrder = function (order) {

      var getOrder = order.indexOf("-");
      var gerTable = getOrder == -1 ? order : order.slice(1, order.length);
      $scope.query.orderby = getOrder == -1 ? "asc" : "desc";
      $scope.query.orderbytable = gerTable;

      Auth.ensureLoggedIn().then(function () {
        $scope.promise = User.all($scope.query).then(function (users) {
          $scope.users = users;
        });
      });

    };

    $scope.onChangeStatus = function (user, status) {
      user.isActive = status;

      User.save(user).then(function () {
        showToast('Status updated');
        $scope.onRefreshTable();
      }, function (error) {
        showToast(error.message);
      });
    };

    $scope.onPaginationChange = function (page, limit) {
      $scope.query.page = page;
      $scope.query.limit = limit;
      $scope.onRefreshTable();
    }

    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    }

    $scope.onViewUser = function (ev, user) {

      $mdDialog.show({
        controller: 'DialogUserDetailViewController',
        templateUrl: '/views/detail/user.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        locals: {
          user: user
        },
        clickOutsideToClose: false
      });
    };

    $scope.onSaveUser = function (ev, user) {

      $mdDialog.show({
        controller: 'DialogUserController',
        templateUrl: '/views/partials/user.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        locals: {
          user: user || null
        },
        clickOutsideToClose: false
      })
        .then(function (answer) {
          $scope.onRefreshTable();
        });
    }

    $scope.onDeleteUser = function (ev, user) {

      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete the user?')
        .ok('Delete')
        .cancel('Cancel')
        .targetEvent(ev);

      $mdDialog.show(confirm).then(function () {

        User.delete({
          id: user.id
        }).then(function () {
          $scope.onRefreshTable();
          showToast('User ' + user.getUsername() + ' deleted');
        },
          function (error) {
            showToast(error.message);
          });
      });
    };

    $rootScope.$on('onEdit', function (ev, user) {
      $scope.onSaveUser(null, user);
    });

  }).controller('DialogUserDetailViewController',
  function ($scope, $rootScope, $mdDialog, user) {

    $scope.user = user;

    $scope.onEdit = function () {
      $mdDialog.cancel();
      $rootScope.$broadcast('onEdit', user);
    };

    $scope.onCancel = function () {
      $mdDialog.cancel();
    }

  }).controller('DialogUserController',
  function (User, File, $scope, $mdDialog, $mdToast, user) {


    $scope.imageFilename = '';
    
    if (!user) {
      $scope.objUser = User.new();
      $scope.objUser.isActive = true;
    } else {
      $scope.objUser = user;
    }

    if ($scope.objUser.photo) {
      $scope.imageFilename = $scope.objUser.photo.name();
    }

    var showSimpleToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
          .content(message)
          .action('OK')
          .hideDelay(false)
      );
    };

    $scope.uploadImage = function (file) {

      if (file.type.match(/image.*/) === null) {
        showSimpleToast('File not supported');
        return;
      } else {

        $scope.imageFilename = file.name;
        $scope.isUploading = true;

        File.upload(file).then(function (savedFile) {
          $scope.objUser.photo = savedFile;
          $scope.isUploading = false;
          showSimpleToast('File uploaded');
        }, function (error) {

          showSimpleToast(error.message);
          $scope.isUploading = false;
          $scope.objUser.photo = null;

        });
      }
    }

    $scope.onSaveUser = function (isValidForm) {

      if (isValidForm) {

        if ($scope.objUser.isNew() && !$scope.objUser.password) {
          showSimpleToast('Password required');
        } else if ($scope.objUser.isNew() && $scope.objUser.password.length < 6) {
          showSimpleToast('Password should be at least 6 characters');
        } else {

          $scope.isSavingUser = true;

          User.save($scope.objUser).then(function (data) {
            showSimpleToast('User saved');
            $mdDialog.hide();
            $scope.isSavingUser = false;
          }, function (error) {
            showSimpleToast(error.message);
            $scope.isSavingUser = false;
          });
        }
      } else {
        showSimpleToast('Please correct all highlighted errors and try again');
      }
    }

    $scope.hide = function () {
      $mdDialog.cancel();
    }

    $scope.cancel = function () {
      if (!$scope.objUser.isNew()) {
        $scope.objUser.fetch();
      }
      $mdDialog.cancel();
    }

  });