morse = {		
		validCharacters : /^[0-9a-zA-Z]+$/,
		wordSeparator : '|',
		letterSeparator : ' ',
		charCount : 1,
		wordCount : 1,
		undefinedChar : '?',
		frequency : 600,
		wpm : 20,
		enabledCharacters : ['p', 'c', 'm', '1', '8'],
		pickMode : false,
		correctAnswer : null,
		currentAnswer : '',
		playKeys : false,
		alphabet : null,
		
		initialize : function() {
			morse.initializeState();
			morse.updateUrlParameters();
			morse.addListeners();
		}, 
		
		initializeState : function() {
			morse.alphabet = new Map([
				['0', '-----'],
				['1', '.----'],
				['2', '..---'],
				['3', '...--'],
				['4', '....-'],
				['5', '.....'],
				['6', '-....'],
				['7', '--...'],
				['8', '---..'],
				['9', '----.'],
				['a', '.-'],
				['b', '-...'],
				['c', '-.-.'],
				['d', '-..'],
				['e', '.'],
				['f', '..-.'],
				['g', '--.'],
				['h', '....'],
				['i', '..'],
				['j', '.---'],
				['k', '-.-'],
				['l', '.-..'],
				['m', '--'],
				['n', '-.'],
				['o', '---'],
				['p', '.--.'],
				['q', '--.-'],
				['r', '.-.'],
				['s', '...'],
				['t', '-'],
				['u', '..-'],
				['v', '...-'],
				['w', '.--'],
				['x', '-..-'],
				['y', '-.--'],
				['z', '--..'],
				[' ', morse.wordSeparator]
			]);
		},
		
		updateKeysForEnabledCharacters : function() {	
			$('.key-btn').each(function(){
				var value = $(this).html().toLowerCase();
				if(morse.enabledCharacters.includes(value)) {
					$(this).removeClass('btn-outline-primary').addClass('btn-primary').prop('disabled', false);					
				} else {
					$(this).removeClass('btn-primary').addClass('btn-outline-primary').prop('disabled', true);
				}
			});
		},
		
		updateUrlParameters : function() {
			var queryString = window.location.search;
			var urlParams = new URLSearchParams(queryString);

			morse.updateWpm(urlParams.get('wpm'));
			morse.updateCharCount(urlParams.get('charCount'));
			morse.updateWordCount(urlParams.get('wordCount'));
			morse.updateChars(urlParams.get('chars'));
		},
		
		addListeners : function() {
			morse.addButtonListeners();
			morse.addKeyListeners();
			morse.addBlurListeners();
		},
		
		addButtonListeners : function() {
			$(document).on('click', '.key-btn', function() {
				morse.keyButtonClicked($(this));
			});
			$(document).on('click', '#pick-button', function() {
				morse.pickButtonClicked();
			}),
			$(document).on('click', '#run-button', function() {
				morse.runButtonClicked($(this));
			});
			$(document).on('click', '.alert .close', function(){
				morse.hideAlert(100);
			});
			$(document).on('click', '#char-btn-all', function() {
				morse.enableCharacters('all');
			});
			$(document).on('click', '#char-btn-none', function() {
				morse.enableCharacters('none');
			});
			$(document).on('click', '#char-btn-letters', function() {
				morse.enableCharacters('letters');
			});
			$(document).on('click', '#char-btn-numbers', function() {
				morse.enableCharacters('numbers');
			});
			$(document).on('click', '#char-btn-vowels', function() {
				morse.enableCharacters('vowels');
			});
			$(document).on('click', '#run-button, .filter-btn', morse.turnPickModeOff);
			$(document).on('click', '.filter-btn', morse.reset);
		
		},
		
		addKeyListeners : function() {
			$(document).on('keypress', function(event){
				var code = event.which;
				if(code == 13) {
					$('#run-button').click();
				} else {
					var char = String.fromCharCode(code).toUpperCase();
					$('.key-btn:contains(' + char + ')').click();
				}
			});
			$(document).on('keyup', function(event) {
				if(event.which == 27) {
					morse.reset();
				}
			});
		},
		
		addBlurListeners : function() {
			$(document).on('blur', '#wpm', function(){
				morse.wpm = $(this).val();
			});
			$(document).on('blur', '#char-count', function(){
				morse.charCount = $(this).val();
			});
			$(document).on('blur', '#word-count', function(){
				morse.wordCount = $(this).val();
			});			
		},
		
		reset : function() {
			morse.turnPickModeOff();
			morse.enableRunButton();
			morse.correctAnswer = null;
		},
		
		updateWpm : function(value) {
			var wpm = morse.wpm;
			if(value != undefined && morse.hasOption('#wpm', value)) {
				wpm = value;
			}
			$('#wpm').val(wpm).blur();
		},
		
		updateCharCount : function(value) {
			var count = value;
			if(isNaN(count) || count < 1 || count > 99) {
				count = morse.charCount;	
			}
			$('#char-count').val(count).blur();
		},
		
		updateWordCount : function(value) {
			var count = value;
			if(isNaN(count) === null || count < 1 || count > 99) {
				count = morse.wordCount;	
			}
			$('#word-count').val(count).blur();
		},
		
		updateChars : function(value) {
			if(value != undefined) {
				morse.enabledCharacters.splice(0, morse.enabledCharacters.length);
				for(var i = 0; i < value.length; ++i) {
					morse.enabledCharacters.push(value.charAt(i));
				}
			} else {
				morse.enableCharacters('all');
			}		
			morse.updateKeysForEnabledCharacters();
		},
		
		enableCharacters : function(type) {
			morse.disableAllCharacters();
			switch(type) {
				case 'all':
					for(var ch of morse.alphabet.keys()) {
						morse.enabledCharacters.push(ch);
					}
					break;
				case 'letters':
					var chars = 'abcdefghijklmnopqrstuvwxyz';
					for(var i = 0; i < chars.length; ++i) {
						morse.enabledCharacters.push(chars.charAt(i));
					}
					break;
				case 'numbers':
					for(var i = 0; i < 10; ++i) {
						morse.enabledCharacters.push(String(i));
					}
					break;
				case 'vowels':
					var chars = 'aeiou';
					for(var i = 0; i < chars.length; ++i) {
						morse.enabledCharacters.push(chars.charAt(i));
					}
					break;
			}
			morse.updateKeysForEnabledCharacters();
		},
		
		disableAllCharacters : function() {
			morse.enabledCharacters.splice(0, morse.enabledCharacters.length);
		},
		
		keyButtonClicked : function(button) {
			if(morse.pickMode) {
				$(button).toggleClass('btn-primary btn-outline-primary');
			} else {
				var value = $(button).html();
				if(morse.guessing()) {
					morse.processAnswer(value);
				} else {
					morse.play(morse.plainToMorseCode(value));
				}			
			}
		},
		
		processAnswer : function(value) {
			console.log('processAnswer');
			morse.currentAnswer += value.toLowerCase();
			console.log(morse.currentAnswer);
			if(morse.correctAnswer.length == morse.currentAnswer.length) {
				var correct = morse.correctAnswer === morse.currentAnswer;
				if(correct) {
					morse.showSuccess('Correct!', morse.correctAnswer.toUpperCase(), 250);
					morse.play(morse.plainToMorseCode(morse.correctAnswer));
				} else {
					morse.showError('Nope...', 'The answer was ' + morse.correctAnswer.toUpperCase(), 250);
				}
				morse.currentAnswer = '';
				morse.correctAnswer = null;
				morse.enableRunButton();
			}
		},
		
		guessing : function() {
			return morse.correctAnswer !== null;
		},
		
		pickButtonClicked : function() {
			if(morse.pickMode) {
				morse.turnPickModeOff();
			} else {
				morse.turnPickModeOn();
			}			
		},
		
		turnPickModeOn : function() {
			morse.pickMode = true;
			$('#pick-button').html('Done');
			morse.enableKeyButtons();
		},
		
		turnPickModeOff : function() {
			morse.pickMode = false;
			$('#pick-button').html('Pick');
			morse.disableKeyButtons();
			morse.updateEnabledCharacters();
		},
		
		updateEnabledCharacters : function() {
			morse.disableAllCharacters();
			$('.key-btn').not(':disabled').each(function(){
				var value = $(this).html().toLowerCase();
				morse.enabledCharacters.push(value);
			});
		},
		
		runButtonClicked : function(button) {
			morse.hideAlert(100);
			morse.disableRunButton();
			
			var plainChars = '';
			for(var i = 0; i < morse.charCount; ++i) {
				plainChars += morse.getRandomCharacter();
			}
			var morseChars = morse.plainToMorseCode(plainChars);
			
			morse.correctAnswer = plainChars;
			morse.play(morseChars);
			
			console.log('Playing ' + morseChars + ' looking for ' + plainChars);
		},
		
		enableKeyButtons : function() {
			$('.key-btn').prop('disabled', false);
		},
		
		disableKeyButtons : function() {
			$('.key-btn.btn-outline-primary').prop('disabled', true);
		},
		
		enableRunButton : function() {
			$('#run-button').prop('disabled', false).find('.spinner-grow').remove();
		},
		
		disableRunButton : function() {
			var spinner = $('<span></span>').addClass('spinner-grow spinner-grow-sm')
				.css('margin-left', '6px').css('margin-bottom', '5px');
			$('#run-button').prop('disabled', true).append(spinner);
		},
		
		getRandomCharacter : function() {
			var index = Math.floor(Math.random() * morse.enabledCharacters.length);
			return morse.enabledCharacters[index];
		},
		
		playInput : function() {
			var plain = $('#plain-input').val();
			var morseCode = morse.plainToMorseCode(plain);
			morse.play(morseCode);
		},
		
		plainToMorseCode : function(plain) {
			var morseCode = '';
			
			plain = plain.toLowerCase();
				
			for(var i = 0; i < plain.length; ++i) {
				var plainChar = plain.charAt(i);
				var morseChar = morse.alphabet.get(plainChar);
				if(morseChar === undefined) {
					morseChar = undefinedChar;
				}
				morseCode += morseChar;
				if(plainChar.match(morse.validCharacters)) {
					morseCode += morse.letterSeparator;
				}
			} 
			morseCode = morseCode.replace(morse.letterSeparator + morse.wordSeparator, morse.wordSeparator);
			return morseCode;
		},
		
		play : function(input) {
			emitter.emit(morse.buildEmitterOptions(input));
		},
		
		buildEmitterOptions : function(input) {
			return {
				input : input,
				letterSeparator : morse.letterSeparator,
				wordSeparator : morse.wordSeparator,
				wpm : morse.wpm,
				frequency : morse.frequency,
				type : 'sine'			
			};
		},
		
		// shouldn't need this buy $('#optId option[value="x"]').length 
		// is always returning zero for some reason
		hasOption : function(selectId, value) {
			var has = false;
			
			$(selectId).find('option').each(function(){
				if($(this).val() == value) {
					has = true;
				}
			});
			
			return has;
		},
		
		showSuccess : function(main, sub, speed) {
			 var alert = $('.alert').removeClass('alert-danger').addClass('alert-success');
			 $(alert).find('.main').html(main);
			 $(alert).find('.sub').html(sub);
			 $(alert).animate({opacity:1}, speed);
		},
		
		showError : function(main, sub, speed) {
			 var alert = $('.alert').addClass('alert-danger').removeClass('alert-success');
			 $(alert).find('.main').html(main);
			 $(alert).find('.sub').html(sub);
			 $(alert).animate({opacity:1}, speed);
		},
		
		hideAlert : function(speed) {
			$('.alert').animate({opacity:0}, speed);
		}
};

$(document).ready(morse.initialize);