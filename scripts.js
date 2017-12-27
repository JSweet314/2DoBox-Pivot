$(document).ready(getIncompleteCards);
$('.append-here').on('click', 'h3, p', enableEditableContent);
$('.append-here').on('keydown', 'h3, p', enterDisablesEditableContent);
$('#search-field').on('keyup', filterIdeas);
$('.header').on('keyup', '#input-title, #input-task', enableSaveButton);
$('#save-btn').on('click', createCard);
$('.append-here').on('click', '#delete-btn', removeCard);
$('.append-here').on('click', '#upvote-btn, #downvote-btn', changeImportance);
$('.append-here').on('blur', 'h3', editTitle);
$('.append-here').on('blur', 'p', editTask);
$('.append-here').on('click', '#completed-task', strikeCompletedTask);
$('#show-complete').on('click', getCompletedCards);
$('#show-more-cards').on('click', getMoreThanTenCards);

function NewCard (title, task) {
  this.id = Date.now();
  this.title = title;
  this.task = task;
  this.importance = 'normal';
  this.complete = false;
}

function createCard(event) {
  event.preventDefault();
  var card = new NewCard ($('#input-title').val(), $('#input-task').val());
  prependCard(card);
  storeCard(card);
  clearInputFields();
  disableSaveButton(); 
}

function prependCard(card) {
 $('.append-here').prepend(templateLiteral(card));
}

function appendCard(card) {
 $('.append-here').append(templateLiteral(card));
}

function templateLiteral(card) {
  return `<article class="cards" id="${card.id}">
  <button class="top-card card-button" id="delete-btn"></button>
  <h3 class="top-card ${card.complete ? 'strike-through' : ''}">${card.title}</h3>
  <p class="${card.complete ? 'strike-through' : ''}">${card.task}</p>
  <button class="card-button bottom-line" id="upvote-btn"></button>
  <button class="card-button bottom-line" id="downvote-btn"></button>
  <h6 class="bottom-line">quality: <span class="quality-change">${card.importance}</span></h6>
  <button id="completed-task">Completed Task</button>
  <hr>
  </article>`;
}

function strikeCompletedTask() {
  $(this).parent().children('p, h3').toggleClass('strike-through');
  var storageId = $(this).parent().attr('id');
  var parsedCard = retrieveCard(storageId);
  parsedCard.complete = parsedCard.complete ? false : true;
  storeCard(parsedCard);
}

function storeCard(card) {
  var stringifiedCard = JSON.stringify(card);
  localStorage.setItem(card.id, stringifiedCard);
}

function retrieveCard(cardId) {
  var storedId = localStorage.getItem(cardId);
  var parseId = JSON.parse(storedId);
  return parseId;
}

function getIncompleteCards() {
  if (localStorage.length > 10) {
    getFirstTenCards();
  } else {
    getAllIncomplete();
  }
}

function getAllIncomplete() {
  for(var i = 0; i < localStorage.length; i++) {
    var retrieveCard = localStorage.getItem(localStorage.key(i));
    var parseCard = JSON.parse(retrieveCard);
    if (parseCard.complete === false) {
      prependCard(parseCard);  
    }
  } 
}

function getFirstTenCards() {
  for(var i = localStorage.length - 10; i < localStorage.length; i++) {
    var retrieveCard = localStorage.getItem(localStorage.key(i));
    var parseCard = JSON.parse(retrieveCard);
    if (parseCard.complete === false) {
      prependCard(parseCard);  
    }
  } 
}

function getCompletedCards() {
  for(var i = 0; i < localStorage.length; i++) {
    var retrieveCard = localStorage.getItem(localStorage.key(i));
    var parseCard = JSON.parse(retrieveCard);
    if (parseCard.complete === true) {
      prependCard(parseCard);  
    }
  }
}

function getMoreThanTenCards() {
  for(var i = localStorage.length - 11; i >= 0; i--) {
    var retrieveCard = localStorage.getItem(localStorage.key(i));
    var parseCard = JSON.parse(retrieveCard);
    if (parseCard.complete === false) {
      appendCard(parseCard);  
    }
  } 
}

function removeCard() {
  var idRemoved = $(this).parent().attr('id');
  $(this).parent().remove();
  localStorage.removeItem(idRemoved);
}

function changeImportance() {
  var cardId = $(this).parent().attr('id');
  var parsedCard = retrieveCard(cardId);
  var htmlText = $(this).siblings('h6').children('span');
  var arrayOptions = ['none', 'low', 'normal', 'high', 'critical']
  var index = arrayOptions.indexOf(htmlText.text());
  if (event.target.id === 'upvote-btn') {
    htmlText.text(arrayOptions[index + 1]);
  } else {
    htmlText.text(arrayOptions[index - 1]);
  }
  parsedCard.importance = htmlText.text();
  storeCard(parsedCard);
}

function editTitle() {
  var cardId = $(this).parent().attr('id');
  var storedId = localStorage.getItem(cardId);
  var parseObject = JSON.parse(storedId);
  var titleText = $(this).text();
  parseObject.title = titleText;
  var stringTitle = JSON.stringify(parseObject);
  localStorage.setItem(cardId, stringTitle);
}

function editTask() {
  var cardId = $(this).parent().attr('id');
  var storedId = localStorage.getItem(cardId);
  var parseObject = JSON.parse(storedId);
  var paraObject = $(this).text();
  parseObject.task = paraObject;
  var stringBody = JSON.stringify(parseObject);
  localStorage.setItem(cardId, stringBody);
}

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
  var inputTask = $('#input-task').val();
  if (inputTittle == '' || inputTask == '') {
    $('#save-btn').prop('disabled', true);
  } else {
    $('#save-btn').prop('disabled', false);
  }
}

function disableSaveButton() {
  $('#save-btn').prop('disabled', true);
}

function clearInputFields() {
  $('#input-title').val('');
  $('#input-task').val('');
  $('#input-title').focus();
}