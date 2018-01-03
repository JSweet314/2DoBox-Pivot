$(document).ready(getIncompleteCards);
$('#input-title, #input-task').on('keyup', toggleSaveButton);
$('#save-btn').on('click', createCard);
$('#search-field').on('keyup', filterSearchText);
$('.append-here').on('click', '#delete-btn', removeCard);
$('.append-here').on('click', 'h3, p', enableEditableContent);
$('.append-here').on('keydown', 'h3, p', enterDisablesEditableContent);
$('.append-here').on('blur', 'h3', editTitle);
$('.append-here').on('blur', 'p', editTask);
$('.append-here').on('click', '#upvote-btn, #downvote-btn', changeImportance);
$('.append-here').on('click', '#completed-task', strikeCompletedTask);
$('#show-complete').on('click', getCompletedCards);
$('#show-more-cards').on('click', getMoreThanTenCards);
$('.show-importance').on('click', displayCardsByImportance);
$('.append-here').on('blur', '#date', persistDueDate);

function createCard(event) {
  event.preventDefault();
  var card = new NewCard ($('#input-title').val(), $('#input-task').val());
  prependCard(card);
  storeCard(card);
  clearInputFields();
  disableSaveButton(); 
}

function NewCard (title, task) {
  this.id = Date.now();
  this.title = title;
  this.task = task;
  this.importance = 'normal';
  this.complete = false;
  this.dueDate = '';
}

function cardTemplateBuilder(card) {
  return `<article class="cards ${card.dueDate && (card.dueDate < moment().format('YYYY-MM-DD')) ? 'passed-due' : ''}" id="${card.id}">
  <button class="top-card card-button" id="delete-btn"></button>
  <h3 class="top-card ${card.complete ? 'strike-through' : ''}">${card.title}</h3>
  <p class="${card.complete ? 'strike-through' : ''}">${card.task}</p>
  <button class="card-button bottom-line" id="upvote-btn"></button>
  <button class="card-button bottom-line" id="downvote-btn"></button>
  <h6 class="bottom-line">Importance: <span class="quality-change">${card.importance}</span></h6>
  <label>Due Date: <input id="date" type="date" value=${card.dueDate ? card.dueDate : ''}></label>
  <button id="completed-task">Completed Task</button>
  <hr>
  </article>`;
}

function toggleSaveButton() {
  var inputTittle = $('#input-title').val();
  var inputTask = $('#input-task').val();
  if (inputTittle == '' || inputTask == '') {
    disableSaveButton();
  } else {
    toggleSaveByCharacterCount();
  }
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

function getAllIncomplete() {
  for(var i = 0; i < localStorage.length; i++) {
    var parsedCard = retrieveCard(localStorage.key(i));
    if (parsedCard.complete === false) {
      prependCard(parsedCard);  
    }
  }
  $('#show-more-cards').prop('disabled', true); 
}

function getCompletedCards() {
  removeCompletedCards();
  for(var i = 0; i < localStorage.length; i++) {
    var parsedCard = retrieveCard(localStorage.key(i));
    if (parsedCard.complete === true) {
      prependCard(parsedCard);  
    }
  }
  $(event.target).prop('disabled', true);
}

function getIncompleteCards() {
  if (localStorage.length > 10) {
    getFirstTenCards();
  } else {
    getAllIncomplete();
  }
}

function getFirstTenCards() {
  for(var i = localStorage.length - 10; i < localStorage.length; i++) {
    var parsedCard = retrieveCard(localStorage.key(i));
    if (parsedCard.complete === false) {
      prependCard(parsedCard);  
    }
  } 
}

function getMoreThanTenCards() {
  for(var i = localStorage.length - 11; i >= 0; i--) {
    var parsedCard = retrieveCard(localStorage.key(i));
    if (parsedCard.complete === false) {
      appendCard(parsedCard);  
    }
  } 
  $('#show-more-cards').prop('disabled', true);
}

function appendCard(card) {
 $('.append-here').append(cardTemplateBuilder(card));
}

function prependCard(card) {
 $('.append-here').prepend(cardTemplateBuilder(card));
}

function removeCard() {
  var idRemoved = $(this).parent().attr('id');
  $(this).parent().remove();
  localStorage.removeItem(idRemoved);
}

function changeImportance(event) {
  var cardId = $(this).parent().attr('id');
  var parsedCard = retrieveCard(cardId);
  var htmlText = $(this).siblings('h6').children('span');
  toggleImportanceText(htmlText);
  parsedCard.importance = htmlText.text();
  storeCard(parsedCard);
}

function toggleImportanceText(htmlText) {
  var arrayOptions = ['none', 'low', 'normal', 'high', 'critical'];
  var index = arrayOptions.indexOf(htmlText.text());
  if (event.target.id === 'upvote-btn') {
    htmlText.text(arrayOptions[index + 1]);
  } else {
    htmlText.text(arrayOptions[index - 1]);
  }
}

function editTitle() {
  var cardId = $(this).parent().attr('id');
  var parsedCard = retrieveCard(cardId);
  parsedCard.title = $(this).text();
  storeCard(parsedCard);
}

function editTask() {
  var cardId = $(this).parent().attr('id');
  var parsedCard = retrieveCard(cardId);
  parsedCard.task = $(this).text();
  storeCard(parsedCard);
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

function filterSearchText() {
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

function disableSaveButton() {
  $('#save-btn').prop('disabled', true);
}

function enableSaveButton() {
  $('#save-btn').prop('disabled', false);
}

function clearInputFields() {
  $('#input-title').val('');
  $('#input-task').val('');
  $('#input-title').focus();
}

function displayCardsByImportance(event) {
  var choice = $(event.target).text().toLowerCase();
  $('article').each(function(){
    var comparisonText = $(this).find('span').text();
    this.style.display = comparisonText === choice ? '' : 'none';
  });
}

function toggleSaveByCharacterCount() {
  if ($('#input-task').val().length > 120) {
    disableSaveButton();
  } else {
    enableSaveButton();
  }
}

function setDueDate() {
  var dueDate = moment.tz($(event.target).val(), moment.tz.guess());
  if (moment().format('YYYY-MM-DD') > dueDate.format('YYYY-MM-DD')) {
    $(event.target).parents('article').toggleClass('passed-due');
  } else {
    $(event.target).parents('article').removeClass('passed-due');
  }
  return dueDate;
}

function persistDueDate(event) {
  var dueDate = setDueDate(event);
  var cardId = $(this).parents('article').attr('id');
  var parsedCard = retrieveCard(cardId);
  if (dueDate.format('YYYY-MM-DD') != 'Invalid date') {
    parsedCard.dueDate = dueDate.format('YYYY-MM-DD');
  } else {
    parsedCard.dueDate = '';
  } 
  storeCard(parsedCard);
}

function removeCompletedCards() {
  $('article').each(function() {
    if ($(this).find('h3').hasClass('strike-through')){
      $(this).remove();
    }
  });
}