var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter = require('parse-server').S3Adapter;
var FSFilesAdapter = require('parse-server-fs-adapter');
var path = require('path');
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var cookieSession = require('cookie-session');
var MailgunHelper = require('./helpers/mailgun-helper').MailgunHelper;
var Mailgen = require('mailgen');
var moment = require('moment');
var kue = require('kue-scheduler');

// Parse configuration
var databaseUri = process.env.MONGO_URL || process.env.DATABASE_URI || process.env.MONGOLAB_URI;
publicServerUrl = process.env.PUBLIC_SERVER_URL || 'http://localhost:1337/parse';
serverUrl = process.env.SERVER_URL || 'http://localhost:1337/parse';
serverRootUrl = process.env.SERVER_ROOT_URL || 'http://localhost:1337';
var appId = process.env.APP_ID || 'myAppId';
var masterKey = process.env.MASTER_KEY || 'myMasterKey';
var restApiKey = process.env.REST_API_KEY || 'myRestApiKey';
appName = process.env.APP_NAME || 'My App Name';

// Mailgun configuration
var apiKey = process.env.MAILGUN_API_KEY || 'key-004454825826125a446123cf1ca7d3c3';
var domain = process.env.MAILGUN_DOMAIN || 'quanlabs.com';
var fromAddress = process.env.MAILGUN_FROM_ADDRESS || 'QuanLabs <dev@quanlabs.com>';
var toAddress = process.env.MAILGUN_TO_ADDRESS || 'dev@quanlabs.com';

// AWS S3 configuration
var accessKeyId = process.env.AWS_ACCESS_KEY_ID;
var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
var bucketName = process.env.BUCKET_NAME;

// Push configuration
var androidSenderId = process.env.PUSH_ANDROID_SENDER_ID || '952212944443';
var androidApiKey = process.env.PUSH_ANDROID_API_KEY || 'AAAA3bRQdjs:APA91bGRu-AKi0f3qCyKdYK0KvOU2kTFC7WXGxBd9YbDjVllpyAYj9bTOqTEd0T0UYieNXaX-qIi_C_f7RmCQAxtZ1Q71BVYIHiiDjYJei0hHhsO7f8dUe7H-xwZ2407uTCE1eLeAFPF';
var iosBundleId = process.env.PUSH_IOS_BUNDLE_ID || 'com.quanlabs.restaurantapp';

// Redis configuration
var redisUrl = process.env.REDIS_URL;

mailgunHelper = new MailgunHelper({
  apiKey: apiKey,
  domain: domain,
  fromAddress: fromAddress,
  toAddress: toAddress
});

mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: appName,
    link: serverRootUrl
  }
});

var filesAdapter = new FSFilesAdapter();

if (accessKeyId && secretAccessKey && bucketName) {
  filesAdapter = new S3Adapter(
    accessKeyId, secretAccessKey, bucketName, {
      directAccess: true
    });
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/test',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: appId,
  appName: appName,
  masterKey: masterKey,
  serverURL: serverUrl,
  //restAPIKey: restApiKey,
  filesAdapter: filesAdapter,
  publicServerURL: publicServerUrl,
  verifyUserEmails: false,
  push: {
    android: {
      senderId: androidSenderId,
      apiKey: androidApiKey
    },
    ios: [{
      pfx: __dirname + '/certs/dev.p12',
      bundleId: iosBundleId,
      production: false
    },
    {
      pfx: __dirname + '/certs/prod.p12',
      bundleId: iosBundleId,
      production: true
    }
    ]
  },
  emailAdapter: {
    module: 'parse-server-simple-mailgun-adapter',
    options: {
      fromAddress: fromAddress,
      domain: domain,
      apiKey: apiKey,
    }
  }
});

var app = express();

app.all("/classes/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  return next();
});

app.set('view engine', 'ejs');
app.set('views', 'views');

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

app.use(express.static('public'));
app.use(expressLayouts);
app.use(cookieParser());
app.use(methodOverride());

var urlencodedParser = app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());


app.use(cookieSession({
  name: 'appmob.sess',
  secret: '3mxGijWuuQEZ',
  maxAge: 1 * 60 * 60 * 1000
}));

app.use(function (req, res, next) {
  req.session.nowInMinutes = Date.now() / 60e3;
  next();
});

app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.page = req.url.split('/').pop();
  res.locals.appId = appId;
  res.locals.serverUrl = serverUrl;
  next();
});

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

var isNotInstalled = function (req, res, next) {

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return Parse.Promise.error(new Parse.Error(5000, 'Admin Role not found'));
    }

    var userRelation = adminRole.relation('users');
    return userRelation.query().count({
      useMasterKey: true
    });
  }).then(function (count) {

    if (count === 0) {
      next();
    } else {
      req.session = null;
      res.redirect('/login');
    }
  }, function (error) {
    if (error.code === 5000) {
      next();
    } else {
      req.session = null;
      res.redirect('/login');
    }
  })
}

var isAdminOrMerchant = function (req, res, next) {

  var objUser;

  return Parse.Cloud.httpRequest({
    url: serverUrl + '/users/me',
    headers: {
      'X-Parse-Application-Id': appId,
      'X-Parse-REST-API-Key': restApiKey,
      'X-Parse-Session-Token': req.session.token
    }
  }).then(function (userData) {

    objUser = Parse.Object.fromJSON(userData.data);

    var query = new Parse.Query(Parse.Role);
    query.containedIn('name', ['Admin', 'Merchant']);
    query.equalTo('users', objUser);
    return query.first();

  }).then(function (isAdmin) {

    if (!isAdmin) {
      return Parse.Promise.error();
    }

    req.user = objUser;
    return next();

  }).then(null, function () {
    req.session = null;
    res.redirect('/login');
  });
}

var isAdmin = function (req, res, next) {

  var objUser;

  return Parse.Cloud.httpRequest({
    url: serverUrl + '/users/me',
    headers: {
      'X-Parse-Application-Id': appId,
      'X-Parse-REST-API-Key': restApiKey,
      'X-Parse-Session-Token': req.session.token
    }
  }).then(function (userData) {

    objUser = Parse.Object.fromJSON(userData.data);

    var query = new Parse.Query(Parse.Role);
    query.equalTo('name', 'Admin');
    query.equalTo('users', objUser);
    return query.first();

  }).then(function (isAdmin) {

    if (!isAdmin) {
      return Parse.Promise.error();
    }

    req.user = objUser;
    return next();

  }).then(null, function () {
    req.session = null;
    res.redirect('/login');
  });
}

var isNotAuthenticated = function (req, res, next) {

  Parse.Cloud.httpRequest({
    url: serverUrl + '/users/me',
    headers: {
      'X-Parse-Application-Id': appId,
      'X-Parse-REST-API-Key': restApiKey,
      'X-Parse-Session-Token': req.session.token
    }
  }).then(function (userData) {
    res.redirect('/dashboard/users');
  }, function (error) {
    next();
  });
}

app.get('/install', isNotInstalled, function (req, res) {
  res.render('install');
});

app.post('/install', [urlencodedParser, isNotInstalled], function (req, res) {

  var name = req.body.name.trim();
  var username = req.body.username.toLowerCase().trim();
  var password = req.body.password.trim();
  var passwordConfirmation = req.body.passwordConfirmation.trim();

  if (!name) {
    return res.render('install', {
      flash: 'Name is required',
      input: req.body
    });
  }

  if (!username) {
    return res.render('install', {
      flash: 'Email is required',
      input: req.body
    });
  }

  if (password !== passwordConfirmation) {
    return res.render('install', {
      flash: "Password doesn't match",
      input: req.body
    });
  }

  if (password.length < 6) {
    return res.render('install', {
      flash: 'Password should be at least 6 characters',
      input: req.body
    });
  }

  var roles = [];

  var roleACL = new Parse.ACL();
  roleACL.setPublicReadAccess(true);

  roles.push(new Parse.Role('Admin', roleACL));
  roles.push(new Parse.Role('Merchant', roleACL));
  roles.push(new Parse.Role('User', roleACL));

  var user = new Parse.User();
  user.set('firstName', name);
  user.set('lastName', '');
  user.set('username', username);
  user.set('email', username);
  user.set('password', password);
  user.set('accountType', ['Admin']);
  user.set('isSuperAdmin', true);
  user.set('photoThumb', undefined);

  var acl = new Parse.ACL();
  acl.setPublicReadAccess(true);
  acl.setPublicWriteAccess(false);
  user.setACL(acl);

  var query = new Parse.Query(Parse.Role);

  query.find().then(function (objRoles) {
    return Parse.Object.destroyAll(objRoles, {
      useMasterKey: true
    });
  }).then(function () {
    return Parse.Object.saveAll(roles);
  }).then(function () {
    return user.signUp();
  }).then(function (objUser) {

    req.session.user = objUser;
    req.session.token = objUser.getSessionToken();
    res.redirect('/dashboard/users');
  }, function (error) {
    res.render('install', {
      flash: error.message,
      input: req.body
    });
  });
});

app.get('/', function (req, res) {
  res.redirect('/login');
});

app.get('/login', isNotAuthenticated, function (req, res) {
  res.render('login');
});

app.get('/reset-password', isNotAuthenticated, function (req, res) {
  res.render('reset-password');
});

app.get('/dashboard/users', isAdmin, function (req, res) {
  res.render('users');
});

app.get('/dashboard/customers', isAdmin, function (req, res) {
  res.render('customers');
});

app.get('/dashboard/restaurants', isAdmin, function (req, res) {
  res.render('restaurants');
});

app.get('/dashboard/items', isAdmin, function (req, res) {
  res.render('items');
});

app.get('/dashboard/delivery-zone', isAdmin, function (req, res) {
  res.render('delivery-zone');
});

app.get('/dashboard/orders', isAdmin, function (req, res) {
  res.render('orders');
});

app.get('/dashboard/news', isAdmin, function (req, res) {
  res.render('news');
});

app.get('/timezones', function (req, res) {
  var listTimeZone = require('./public/timezones.json');
  res.status(200).json(listTimeZone);
});

app.get('/getorder', function (req, res) {

  var restId = req.query.a; // Device ID

  var query = new Parse.Query('Order');
  query.equalTo('statusOrder', 'Pending');
  query.include(['restaurant', 'customer', 'zone']);

  var innerQuery = new Parse.Query('Restaurant');
  innerQuery.equalTo('printerId', restId);
  query.matchesQuery('restaurant', innerQuery);

  query.first().then(function (order) {

    if (!order) {
      res.status(200).send('');
    }

    var header = '';
    var footer = '';
    var receipt = '';

    var itemList = '';
    var address = '';

    var orderType = order.get('orderType') === 'Delivery' ? '1' : '2'; // 1 = Delivery, 2 = Pickup/Collection
    var isCustomerVerified = '4'; // 4 = Verified, 5 = Not verified
    var paymentStatus = '7'; // 6 = Paid, 7 = Not paid
    var previousOrderNumber = ''; // Previous order number
    var paymentCard = '';
    var creditCardFee = '';

    var orderNumber = order.get('numberOrder');
    var restaurant = order.get('restaurant');
    var items = order.get('items');
    var contactNumber = order.get('contactNumber') || '---';
    var customerName = order.get('customer').get('name') || '---';
    var deliveryFee = order.get('deliveryFee');
    var comments = order.get('comments') || '';
    var total = order.get('total');

    var dateUtc = moment().utcOffset(restaurant.get('hourZone'));
    var timeRequest = dateUtc.format('hh:mm YYYY-MM-DD');

    var header = '#' + restId + '*' + orderType + '*' + orderNumber + '*';

    for (var i = 0; i < items.length; i++) {
      
      var item = items[i];
      itemList += item.quantity + ';' + item.name + ';' + item.amount + ';';
      
      if (item.notes !== '') {
        itemList += ' Comments:;;' + item.notes + ';';
      }
      
    }

    if (order.get('orderType') === 'Delivery') {
      var shipping = order.get('shipping');
      address = shipping.streetAddress + ' ' + shipping.city + ' ' + shipping.state;
    }

    var itemList1 = '';

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        itemList1 += item.quantity + '%0A' + item.externalId + '%0A' + (item.notes || '---') + '%0A';
    }
    
    var region = order.get('zone') ? order.get('zone').get('name') : '---';

    var qr = `${contactNumber}%0A${customerName}%0A${region}%0A${itemList1}${orderNumber}`;

    footer = '*' + deliveryFee + '*' + creditCardFee + ';' + total + ';' +
      isCustomerVerified + ';' + customerName + ';' + address + ';' +
      timeRequest + ';' + previousOrderNumber + ';' +
      paymentStatus + ';' + paymentCard + ';' + contactNumber + ';*' + comments + '%%' + qr +'/q#';

    receipt = header + itemList + footer;
    res.status(200).send(receipt);

  }, function (error) {
    res.status(400).send('');
  });

});

app.get('/replyorder', function (req, res) {

  var params = {
    restId: req.query.a, // 'a' is the 'RestID' which had been set in the device
    orderNumber: Number(req.query.o),  // 'o' is the 'Order No' which come from the order
    status: req.query.ak, // 'ak' is the operation of accepting/rejecting order. acept order = 'Accepted reject order 'Rejected'
    reason: req.query.m, // is the description of accepting/Rejecting
    deliveryTime: req.query.dt, // is the time that the operator input when accepting/ rejecting order
    username: req.query.u,  // username for login your web server
    password: req.query.p // password for login your web server
  };

  var printerLog = new Parse.Object('PrinterLog');
  printerLog.set('printerData', req.query || {});
  printerLog.save();

  var query = new Parse.Query('Order');
  query.equalTo('numberOrder',params.orderNumber);
  query.include(['restaurant', 'customer']);
  query.find({
    success: function (results) {

      var find = false;
      var getObject = {};

      for (var c = 0; c < results.length; c++) {

        var objectOrder = results[c];
        var restaurant = objectOrder.get("restaurant");

        if (restaurant.get('printerId') == params.restId &&
          objectOrder.get('numberOrder') == params.orderNumber) {
          find = true;
          getObject = objectOrder;
          break;
        } else {
          find = false;
        }
      }

      if (find == true) {

        query.get(getObject.id, {

          success: function (order) {

            order.set('statusOrder', params.status);
            order.set('reason', params.reason);

            // Save delivery time only if the order was accepted.
            if (params.status === 'Accepted') {
              order.set('deliveryTime', params.deliveryTime);
            }

            order.save();
            res.status(200).json('success');

          }, error: function (error) {
            res.status(400).json("Error: " + error.code + " " + error.message);
          }
        })

      } else {
        res.status(200).json('Order not found');
      }

    },
    error: function (error) {
      res.status(400).json("Error: " + error.code + " " + error.message);
    }
  });

});

// Logs in the user
app.post('/login', [urlencodedParser, isNotAuthenticated], function (req, res) {

  var username = req.body.username;
  var password = req.body.password;

  Parse.User.logIn(username, password).then(function (user) {

    var query = new Parse.Query(Parse.Role);
    query.containedIn('name', ['Admin', 'Merchant']);
    query.equalTo('users', user);
    query.first().then(function (role) {

      if (!role) {
        res.render('login', {
          flash: 'Not Authorized'
        });
      } else if (user.get('status') === 'Suspend' || user.get('status') === 'Inactive') {
        res.render('login', {
          flash: 'Account Suspended or Inactive'
        });
      } else {
        req.session.user = user;
        req.session.token = user.getSessionToken();

        if (role.get('name') === 'Admin') {
          res.redirect('/dashboard/users');
        }

        if (role.get('name') === 'Merchant') {
          res.redirect('/dashboard/orders');
        }

      }

    }, function (error) {
      res.render('login', {
        flash: error.message
      });
    });
  }, function (error) {
    res.render('login', {
      flash: error.message
    });
  });
});

app.get('/logout', isAdmin, function (req, res) {
  req.session = null;
  res.redirect('/login');
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
  console.log(appName + ' running on port ' + port + '.');
});