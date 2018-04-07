
window.onload = function() {

  chrome.storage.sync.get(['addedLinks'], function(result) {
    if(!chrome.runtime.lastError) {
      RenderLinks(result.addedLinks);
    }
    else {
      chrome.storage.sync.set({'addedLinks': []}, function() {
        RenderLinks([]);
      });
    }

    chrome.storage.sync.get(['token'], function(result) {
      console.log(result);
      if(result.token != 'null') {
        setUsername(result.token);
        $('#loginBtn').hide();
      }
    });
    
  });

  document.getElementById('addLink').addEventListener('click', function(e) {
    var addedLinks = [];
    chrome.storage.sync.get(['addedLinks'], function(result) {
      addedLinks = result.addedLinks;


      chrome.tabs.getSelected(null,function(tab) {
        var link = tab.url;
        addedLinks.push(link)
      
        chrome.storage.sync.set({'addedLinks': addedLinks}, function() {
          console.log(addedLinks);

          RenderLinks(addedLinks);
        });
      });

      e.target.blur();
      
    });
  })


  document.getElementById('clearLinks').addEventListener('click', function(e) {
    chrome.storage.sync.set({'addedLinks': []}, function() {
      console.log('addedLinks cleared');
      RenderLinks([]);
    });
    e.target.blur();
  })

  document.getElementById('loginBtn').addEventListener('click', function(e) {
    $('#loginOverlay').show();
    e.target.blur();
  })

  $(document).on('click', '#loginCallToAction', function() {

    var dataToSend = {
      Email: $('#email').val(),
      Password: $('#password').val()
    }

    $.ajax({
      type: 'POST',
      url: 'http://capsulelink.com/api/Auth/Login',
      data: dataToSend,
      dataType: 'json',
      headers: { 
        'Access-Control-Allow-Origin': '*'
      },
      success: function(token) {
        // todo, ako se ne dobije validan token, ispisati poruku da se nije uspesno ulogovao!!!
        chrome.storage.sync.set({'token': token}, function() {
          console.log('Token set up');
          setUsername(token);
          $('#loginOverlay').hide();
          $('#email').val('');
          $('#password').val('');
          $('#loginBtn').hide();
        });
      }
    });
  })


  $(document).on('click', '#generateBtn', function(e) {
    chrome.storage.sync.get(['addedLinks'], function(result) {
      var urls = result.addedLinks;
      var title = $('#groupLinkTitle').val() || 'Untitled';

      var dataToSend = {
        Urls: urls,
        Title: title
      }

      // hide all
      chrome.storage.sync.set({'addedLinks': []}, function() {
        RenderLinks([]);


        // Todo get token!
        chrome.storage.sync.get(['token'], function(result) {
          $.ajax({
            type: 'POST',
            url: 'http://capsulelink.com/api/Links/GenerateGroupLink',
            data: dataToSend,
            dataType: 'json',
            headers: { 
              'Authorization': 'Bearer '+result.token, 
              'Access-Control-Allow-Origin': '*'
            },
            success: function(returnedData) {
              DisplayGroupLink(returnedData);
            }
          });

        });
      });
    });
    e.target.blur();
  })

  $(document).on('click', '#navigateToLink', function() {
    chrome.tabs.update({
      url: $('#generatedUrl').val()
    });
  })

  $(document).on('click', '.close-popup', function() {
    $('#overlay1').hide();
    $('#generatedUrl').val('');
    $('#email').val('');
    $('#password').val('');
    $('#loginOverlay').hide();

  })


  $(document).on('click','.close-btn', function(){
    var id = this.id;
    chrome.storage.sync.get(['addedLinks'], function(result) {
      var addedLinks = result.addedLinks;
      addedLinks.splice(id,1);
      console.log(addedLinks);
      
      chrome.storage.sync.set({'addedLinks': addedLinks}, function() {
        RenderLinks(addedLinks);
      });

    });
  })
}

function RenderLinks(addedLinks) {
  $('#links').html("");
  if(!addedLinks[0]) {
    $('#links').append(`<div id='noLinks'><h4>Start adding links by pressing 'Add this page'.</h4></div>`);
    $('.callToActionWrapper').hide();
    $('#groupLinkTitle').val('');
    return;
  }

  $('.callToActionWrapper').show();

  for(var key in addedLinks){
    console.log(addedLinks[key]);
    $('#links').append(`<div class='col-md-4'><div class='link'>${addedLinks[key]}</div><div class='close-btn' id='${key}'><i class='ion ion-close'></i></div></div>`);
  }
}

function DisplayGroupLink(url) {
  // todo hide all and display only group link.
  $('#generatedUrl').val('http://capsulelink.com/'+url);
  $('#overlay1').show();
}

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
}

function setUsername(token) {
  var decodedToken = parseJwt(token);
  $('.loggedInUsername').html(decodedToken.email);
}