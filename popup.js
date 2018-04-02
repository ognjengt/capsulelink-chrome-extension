
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
        $.ajax({
          type: 'POST',
          url: 'http://capsulelink.com/api/Links/GenerateGroupLink',
          data: dataToSend,
          dataType: 'json',
          headers: { 
            'Authorization': 'Bearer null', 
            'Access-Control-Allow-Origin': '*'
          },
          success: function(returnedData) {
            DisplayGroupLink(returnedData);
          }
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
    $('.overlay').hide();
    $('#generatedUrl').val('');
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
  $('.overlay').show();
}