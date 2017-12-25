$(document).ready(getCard);
$('.append-here').on('click', 'h3, p', enableEditableContent);
$('.append-here').on('keydown', 'h3, p', enterDisablesEditableContent);
$('#search-field').on('keyup', filterIdeas);
$('.header').on('keyup', '#input-title, #input-task', enableSaveButton);


function NewCard (title, task, quality, id){
  this.id = id || Date.now();
  this.title = title;
  this.task = task;
  this.quality = quality || ' swill';
}

NewCard.prototype.prependCard = function() {
 $('.append-here').prepend(`<article class="cards" id="${this.id}">
  <button class="top-card card-button" id="delete-btn"></button>
  <h3 class="top-card">${this.title}</h3>
  <p>${this.task}</p>
  <button class="card-button bottom-line" id="upvote-btn"></button>
  <button class="card-button bottom-line" id="downvote-btn"></button>
  <h6 class="bottom-line">quality:<span class="quality-change">${this.quality}</span></h6>
  <hr>
  </article>`);
};

$('#save-btn').on('click', function(event){
  event.preventDefault();
  var card = new NewCard ($('#input-title').val(), $('#input-task').val());
  card.prependCard();
  $('#input-title').val("");
  $('#input-task').val("");
  storeCard(card);
  disableSaveButton();
});

function storeCard(card){
  var stringifiedCard = JSON.stringify(card);
  localStorage.setItem(card.id, stringifiedCard);
}

function getCard(){
  for(var i = 0; i < localStorage.length; i++){
    var retrieveCard = localStorage.getItem(localStorage.key(i));
    var parseCard = JSON.parse(retrieveCard);
    var refreshCard = new NewCard (parseCard.title, parseCard.task, parseCard.quality, parseCard.id);
    refreshCard.prependCard()
  }
}

$('.append-here').on('click', '#delete-btn', function(event) {
  var idRemoved = $(this).parent().attr('id');
  $(this).parent().remove();
  localStorage.removeItem(idRemoved);
});

$('.append-here').on('click', '#upvote-btn', function(event) { 
  var cardId = $(this).parent().attr('id');
  var storedId = localStorage.getItem(cardId);
  var parseId = JSON.parse(storedId);
  var htmlText = $(this).siblings('h6').children('span');
  if(htmlText.text() === ' swill') {
    htmlText.text(' plausible');
    parseId.quality = ' plausible';
  } else if(htmlText.text() === ' plausible') {
    htmlText.text(' genius');
    parseId.quality = 'genius';
  };
  var stringedId = JSON.stringify(parseId);
  localStorage.setItem(cardId, stringedId);
});

$('.append-here').on('click', '#downvote-btn', function(event) { 
  var cardId = $(this).parent().attr('id');
  var storedId = localStorage.getItem(cardId);
  var parseId = JSON.parse(storedId);
  var htmlText = $(this).siblings('h6').children('span');
  if(htmlText.text() === ' genius') {
    htmlText.text(' plausible');
    parseId.quality = ' plausible';
  } else if(htmlText.text() === ' plausible') {
    htmlText.text(' swill');
    parseId.quality = 'swill';
  };
  var stringedId = JSON.stringify(parseId);
  localStorage.setItem(cardId, stringedId);
});

$('.append-here').on('blur', 'h3', function() {
  var cardId = $(this).parent().attr('id');
  var storedId = localStorage.getItem(cardId);
  var parseObject = JSON.parse(storedId);
  var titleText = $(this).text();
  parseObject.title = titleText;
  var stringTitle = JSON.stringify(parseObject);
  localStorage.setItem(cardId, stringTitle);
});

$('.append-here').on('blur', 'p', function (){
  var cardId = $(this).parent().attr('id');
  var storedId = localStorage.getItem(cardId);
  var parseObject = JSON.parse(storedId);
  var paraObject = $(this).text();
  parseObject.task = paraObject;
  var stringBody = JSON.stringify(parseObject);
  localStorage.setItem(cardId, stringBody);
});

function enableEditableContent() {
  $(this).attr('contenteditable', true);
  $(this).focus();
}

function enterDisablesEditableContent(e) {
  if (e.keyCode === 13){
    $(this).attr('contenteditable', false);
    $(this).blur();
  }
}

function filterIdeas() {
 var search = $('#search-field').val().trim().toLowerCase();
 $('article').each(function() {
  var elementText = $(this).children('p, h3').text().trim().toLowerCase();
  var test = false;
  if (elementText.indexOf(search) > -1) {
    test = true;
  }
  this.style.display = test ? '' : 'none';
});
}

function enableSaveButton() {
  var inputTittle = $('#input-title').val();
  var inputTask = $('#input-Task').val();
  if (inputTittle == '' || inputTask == '') {
    $('#save-btn').prop('disabled', true);
  } else {
    $('#save-btn').prop('disabled', false);
  }
}

function disableSaveButton() {
  $('#save-btn').prop('disabled', true);
}