$(document).ready(getCards);
$('#input-title, #input-task').on('keyup', toggleSaveButton);
$('#save-btn').on('click', createCard);
$('#search-field').on('keyup', filterSearchText);
$('.show-importance').on('click', displayCardsByImportance);
$('#show-complete').on('click', getCompletedCards);
$('#show-more-cards').on('click', getMoreThanTenCards);
$('.append-here').on('click', '#delete-btn', removeCard);
$('.append-here').on('click', 'h3, p', enableEditableContent);
$('.append-here').on('keydown', 'h3, p', enterDisablesEditableContent);
$('.append-here').on('blur', 'h3', editTitle);
$('.append-here').on('blur', 'p', editTask);
$('.append-here').on('click', '#completed-task', strikeCompletedTask);
$('.append-here').on('blur', '#date', persistDueDate);
$('.append-here').on('click', '#upvote-btn, #downvote-btn', changeImportance);

function cardTemplateBuilder(card) {
  return `<article class="cards ${card.dueDate && (card.dueDate < moment().format('YYYY-MM-DD')) ? 'passed-due' : ''}" id="${card.id}">
  <button class="top-card card-button" id="delete-btn"></button>
  <h3 class="top-card ${card.complete ? 'strike-through' : ''}">${card.title}</h3>
  <p class="${card.complete ? 'strike-through' : ''}">${card.task}</p>
  <button class="card-button bottom-line" id="upvote-btn"></button>
  <button class="card-button bottom-line" id="downvote-btn"></button>
  <h6 class="bottom-line">Importance: <span class="quality-change">${card.importance}</span></h6>
  <label>Due Date: <input id="date" type="date" value=${card.dueDate ? card.dueDate : ''}></label>
  <button id="completed-task">Task Completed</button>
  <hr>
  </article>`;
}

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


function toggleSaveButton() {
  var inputTittle = $('#input-title').val();
  var inputTask = $('#input-task').val();
  if (inputTittle == '' || inputTask == '') {
    disableSaveButton();
  } else {
    enableSaveButton();
  }
  updateCharacterCount('#input-title', 1);
  updateCharacterCount('#input-task', 2);
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
  $('#show-more-cards').hide(); 
}

function getCompletedCards() {
  removeCompletedCards();
  for(var i = 0; i < localStorage.length; i++) {
    var parsedCard = retrieveCard(localStorage.key(i));
    if (parsedCard.complete === true) {
      prependCard(parsedCard);  
    }
  }
  $(event.target).hide();
}

function getCards() {
  var completedTasksCount = countCompleteCards()
  hideShowCompletedTasksButton(completedTasksCount)
  if (localStorage.length - completedTasksCount > 10) {
    getFirstTenCards();
  } else {
    getAllIncomplete();
  }
}

function countCompleteCards() {
  var counter = 0;
  for (var i = 0; i < localStorage.length; i++) {
    var parsedCard = retrieveCard(localStorage.key(i));
    if (parsedCard.complete === true) {
      counter++;
    }
  }
  return counter;
}

function hideShowCompletedTasksButton(completedTasksCount) {
  if (completedTasksCount === 0) {
    $('#show-complete').hide();
  }
}

function getFirstTenCards() {
  var completeCardCount = countCompleteCards();
  for (var i = localStorage.length - 10 - completeCardCount; i < localStorage.length; i++) {
    var parsedCard = retrieveCard(localStorage.key(i));
    if (parsedCard.complete === false) {
      prependCard(parsedCard);  
    }
  }
  $('#show-more-cards').show();
}

function getMoreThanTenCards() {
  var completeCardCount = countCompleteCards();
  for(var i = localStorage.length - 11 - completeCardCount; i >= 0; i--) {
    var parsedCard = retrieveCard(localStorage.key(i));
    if (parsedCard.complete === false) {
      appendCard(parsedCard);  
    }
  } 
  $('#show-more-cards').hide();
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

function removeCompletedCards() {
  $('article').each(function() {
    if ($(this).find('h3').hasClass('strike-through')){
      $(this).remove();
    }
  });
}

function removeAllCards() {
  $('article').each(function() {
    $(this).remove();
  });
}

function getStorageCardsByImportance(importance) {
  removeAllCards();
  for(var i = 0; i < localStorage.length; i++) {
    var parsedCard = retrieveCard(localStorage.key(i));
    if (parsedCard.importance === importance && parsedCard.complete === false) {
      prependCard(parsedCard);  
    }
  }
}

function changeImportance(event) {
  var cardId = $(this).parent().attr('id');
  var parsedCard = retrieveCard(cardId);
  var htmlText = $(this).siblings('h6').children('span');
  updateImportanceText(htmlText);
  parsedCard.importance = htmlText.text();
  storeCard(parsedCard);
}

function updateImportanceText(htmlText) {
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
  resetCharCount();
  $('#input-title').focus();
}

function resetCharCount() {
  $('.character-count').each(function () {
    $(this).text('Characters Left: 120');
    $(this).removeClass("max-characters");
  });
}

function displayCardsByImportance(event) {
  var choice = $(event.target).text().toLowerCase();
  getStorageCardsByImportance(choice);
  $('#show-more-cards').hide();
  displayCardsRegardlessOfImportance(event);
}

function displayCardsRegardlessOfImportance(event) {
  if ($(event.target).text() === 'all') {
    getCards();
  }
}

function updateCharacterCount(element, nth) { 
  $(`.character-count:nth-of-type(${nth})`).text(`Characters Left: ${120 - $(element).val().length}`);
  maxCharDisplay(element, nth);
}

function maxCharDisplay(element, nth) {
  if ($(element).val().length === 120) {
    $(`.character-count:nth-of-type(${nth})`).addClass("max-characters");
  } else {
    $(`.character-count:nth-of-type(${nth})`).removeClass("max-characters");
  }
}

function setDueDate() {
  var dueDate = moment.tz($(event.target).val(), moment.tz.guess());
  if (moment().format('YYYY-MM-DD') > dueDate.format('YYYY-MM-DD')) {
    $(event.target).parents('article').addClass('passed-due');
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