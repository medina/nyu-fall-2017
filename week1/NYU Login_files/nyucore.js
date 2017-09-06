// jQuery.XDomainRequest.js
// Author: Jason Moon - @JSONMOON
// Contributor: Christian Colon
// jQuery Ajax Transport Plugin required to support IE8/9's XDomainRequest
if (!jQuery.support.cors && window.XDomainRequest) {
  var httpRegEx = /^https?:\/\//i;
  var getOrPostRegEx = /^get|post$/i;
  var sameSchemeRegEx = new RegExp('^'+location.protocol, 'i');
  var jsonRegEx = /\/json/i;
  var xmlRegEx = /\/xml/i;

  // ajaxTransport exists in jQuery 1.5+
  jQuery.ajaxTransport('text html xml json', function(options, userOptions, jqXHR){
    // XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
    if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(userOptions.url) && sameSchemeRegEx.test(userOptions.url)) {
      var xdr = null;
      var userType = (userOptions.dataType||'').toLowerCase();
      return {
        send: function(headers, complete){
          xdr = new XDomainRequest();
          if (/^\d+$/.test(userOptions.timeout)) {
            xdr.timeout = userOptions.timeout;
          }
          xdr.ontimeout = function(){
            complete(500, 'timeout');
          };
          xdr.onload = function(){
            var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
            var status = {
              code: 200,
              message: 'success'
            };
            var responses = {
              text: xdr.responseText
            };
            /*
            if (userType === 'html') {
              responses.html = xdr.responseText;
            } else
            */
            try {
              if ((userType === 'json') || ((userType !== 'text') && jsonRegEx.test(xdr.contentType))) {
                try {
                  responses.json = $.parseJSON(xdr.responseText);
                } catch(e) {
                  status.code = 500;
                  status.message = 'parseerror';
                  //throw 'Invalid JSON: ' + xdr.responseText;
                }
              } else if ((userType === 'xml') || ((userType !== 'text') && xmlRegEx.test(xdr.contentType))) {
                var doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.async = false;
                try {
                  doc.loadXML(xdr.responseText);
                } catch(e) {
                  doc = undefined;
                }
                if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                  status.code = 500;
                  status.message = 'parseerror';
                  throw 'Invalid XML: ' + xdr.responseText;
                }
                responses.xml = doc;
              }
            } catch(parseMessage) {
              throw parseMessage;
            } finally {
              complete(status.code, status.message, responses, allResponseHeaders);
            }
          };
          xdr.onerror = function(){
            complete(500, 'error', {
              text: xdr.responseText
            });
          };
          var postData = (userOptions.data && $.param(userOptions.data)) || '';
          xdr.open(options.type, options.url);
          // Must define the onprogress handler and wrap the send() function in a timeout declaration to help prevent IE from improperly aborting the request.
          xdr.onprogress = function(){ };
          setTimeout(function(){
              xdr.send(postData);
          }, 0);
        },
        abort: function(){
          if (xdr) {
            xdr.abort();
          }
        }
      };
    }
  });
}
//
// NYU's custom jQuery Extensions
//

// $.getScript doesn't cache scripts. This helper function does.
$.getCachedScript = function(url, options) {
    options = $.extend(options || {}, {
        dataType: "script",
        cache: true,
        url: url
    });
    // Return the jqXHR object so we can chain callbacks
    return jQuery.ajax(options);
};

jQuery.fn.loadPlugin = function(url, callback) {
    var pluginId = url.replace(/\./g,'_').replace(/:/g,'_').replace(/\//g,'_');
    // "this" is available for the plugin as it would be here "$(this)", just call it as "this", not "$(this)"
    return this.each(function() {
        var host = $(this);
        $(function() {
            if (!($("body").data(pluginId)) || !($("body").data(pluginId) === true)) {
                $("body").data(pluginId, true);
                $.getCachedScript(url)
                .done(function(script, textStatus) {
                    if(callback != null) {
                        callback(host);
                    }
                })
                .fail(function(jqxhr, settings, exception) {
                    if( console && console.log ) {
                        console.log("Triggered ajaxError handler.");
                    }
                });
            } else if ($("body").data(pluginId) === true) {
                if(callback != null) {
                    callback(host);
                }
            }
        });
    });
};
    
//
// NYU's core JS
// NYU's functions are namespaced for clarity and safety
//

function nyuconstructor() {}
var nyu = new nyuconstructor;

nyuconstructor.prototype.loadPagePlugin = function(url, callback) {
    var pluginId = url.replace(/\./g,'_').replace(/:/g,'_').replace(/\//g,'_');
    $(function() { // Execute on page load so it acts on all content, not just that of first call
         if (!($("body").data(pluginId)) || !($("body").data(pluginId) === true)) {
            $("body").data(pluginId, true);
            $.getCachedScript(url).done(function(script, textStatus) {
                if(callback != null) {
                    callback();
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                if( console && console.log ) {
                    console.log("error: " + textStatus);
                }
            });
        }
    });
};
nyuconstructor.prototype.sortJsonArrayByProperty = function(objArray, prop, direction){
    //todo: identify this sort algorithm
    if (arguments.length<2) throw new Error("sortJsonArrayByProp requires 2 arguments");
    var direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending
    if (objArray && objArray.constructor===Array){
        var propPath = (prop.constructor===Array) ? prop : prop.split(".");
        objArray.sort(function(a,b){
            for (var p in propPath){
                if (a[propPath[p]] && b[propPath[p]]){
                    a = a[propPath[p]];
                    b = b[propPath[p]];
                }
            }
            // convert numeric strings to integers
            a = a.match(/^\d+$/) ? +a : a;
            b = b.match(/^\d+$/) ? +b : b;
            return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
        });
    }
}
nyuconstructor.prototype.groupJsonArrayByProperty = function(array, predicate) {
    var grouped = {};
    for(var i = 0; i < array.length; i++) {
        var groupKey = predicate(array[i]);
        if (typeof(grouped[groupKey]) === "undefined")
            grouped[groupKey] = [];
        grouped[groupKey].push(array[i]);
    }
    return grouped;
}
