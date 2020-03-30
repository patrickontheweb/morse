morse = {		
		validCharacters : /^[0-9a-zA-Z]+$/,
		wordSeparator : '|',
		letterSeparator : ' ',
		undefinedChar : '?',
		frequency : 600,
		wpm : 20,
		enabledCharacters : ['p', 'c', 'm', '1', '8'],
		setupMode : false,
		correctAnswer : null,
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
			
			morse.updateKeysForEnabledCharacters();
		},
		
		updateKeysForEnabledCharacters : function() {			
			$('.key-btn').each(function(){
				var value = $(this).html().toLowerCase();
				if(morse.enabledCharacters.includes(value)) {
					$(this).removeClass('btn-outline-info').addClass('btn-info').prop('disabled', false);					
				} else {
					$(this).removeClass('btn-info').addClass('btn-outline-info').prop('disabled', true);
				}
			});
		},
		
		updateUrlParameters : function() {
			var queryString = window.location.search;
			var urlParams = new URLSearchParams(queryString);
			morse.updateWpm(urlParams.get('wpm'));
		},
		
		addListeners : function() {
			morse.addButtonListeners();
			morse.addBlurListeners();
		},
		
		addButtonListeners : function() {
			$(document).on('click', '.key-btn', function() {
				morse.keyButtonClicked($(this));
			});
			$(document).on('click', '#setup-button', function() {
				morse.setupButtonClicked($(this));
			}),
			$(document).on('click', '#random-button', function() {
				morse.randomButtonClicked($(this));
			});
			$(document).on('click', '.alert .close', function(){
				morse.hideAlert(100);
			});
		
		},
		
		addBlurListeners : function() {
			$(document).on('blur', '#wpm', function(){
				morse.wpm = $(this).val();
			});
			
		},
		
		updateWpm : function(value) {
			var wpm = 20;
			if(value != undefined && morse.hasOption('#wpm', value)) {
				wpm = value;
			}
			$('#wpm').val(wpm).blur();
		},
		
		keyButtonClicked : function(button) {
			if(morse.setupMode) {
				$(button).toggleClass('btn-info btn-outline-info');
			} else {
				var value = $(button).html();
				var morseCode = morse.plainToMorseCode(value);
				if(morse.correctAnswer !== null) {
					morse.enableRandomButton();
					var correct = value.toLowerCase() == morse.correctAnswer;
					if(correct) {
						morse.showSuccess('Correct!', 'The letter was ' + value, 250);
						morse.play(morseCode);
					} else {
						morse.showError('Nope!', 'It was ' + morse.correctAnswer.toUpperCase(), 250);
					}
				} else {
					morse.play(morseCode);
				}
				morse.correctAnswer = null;				
			}
		},
		
		setupButtonClicked : function(button) {
			morse.setupMode = $(button).html() === 'Setup';
			$(button).html(morse.setupMode ? 'Done' : 'Setup');
			if(morse.setupMode) {
				morse.enableKeyButtons();
			} else {
				morse.disableKeyButtons();
				morse.updateEnabledCharacters();
			}
		},
		
		updateEnabledCharacters : function() {
			morse.enabledCharacters.splice(0, morse.enabledCharacters.length);
			$('.key-btn').not(':disabled').each(function(){
				var value = $(this).html().toLowerCase();
				morse.enabledCharacters.push(value);
			});
			console.log(morse.enabledCharacters);
		},
		
		randomButtonClicked : function(button) {
			morse.hideAlert(100);
			morse.disableRandomButton();
			
			var plainChar = morse.getRandomCharacter();
			var morseChar = morse.plainToMorseCode(plainChar);
			
			morse.correctAnswer = plainChar;
			morse.play(morseChar);
			
			console.log('Playing ' + morseChar + ' looking for ' + plainChar);
		},
		
		enableKeyButtons : function() {
			$('.key-btn').prop('disabled', false);
		},
		
		disableKeyButtons : function() {
			$('.key-btn.btn-outline-info').prop('disabled', true);
		},
		
		enableRandomButton : function() {
			$('#random-button').prop('disabled', false).find('.spinner-grow').remove();
		},
		
		disableRandomButton : function() {
			var spinner = $('<span></span>').addClass('spinner-grow spinner-grow-sm')
				.css('margin-left', '6px').css('margin-bottom', '2px');
			$('#random-button').prop('disabled', true).append(spinner);
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