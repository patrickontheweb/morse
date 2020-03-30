var ctx = new (window.AudioContext || window.webkitAudioContext)();
var wordSeparator = '|';
var letterSeparator = ' ';
var undefinedChar = '?';

morse = {		
		validCharacters : /^[0-9a-zA-Z]+$/,
		wpm : 20,
		setupMode : false,
		correctAnswer : null,
		playKeys : false,
		alphabet : new Map([
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
			[' ', wordSeparator]
		]),
		
		initialize : function() {
			morse.initializeState();
			morse.updateUrlParameters();
			morse.addListeners();
		}, 
		
		initializeState : function() {
			
		},
		
		updateUrlParameters : function() {
			var queryString = window.location.search;
			var urlParams = new URLSearchParams(queryString);
			morse.updateWpm(urlParams.get('wpm'));
		},
		
		addListeners : function() {
			morse.addButtonListeners();
			morse.addKeyListeners();
			morse.addBlurListeners();
		},
		
		addButtonListeners : function() {
			$(document).on('click', '#play-button', function() {
				morse.playInput();
			});
			$(document).on('click', '#clear-button', function() {
				morse.clearInput();
			});
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
		
		addKeyListeners : function() {
			$(document).on('keypress', function(event) {
				if(morse.playKeys) {
					morse.play(morse.alphabet.get(String.fromCharCode(event.which)));
				}
			});
			$(document).on('keyup', '#plain-input', function() {
				var plain = $(this).val();
				$('#morse-input').html(morse.plainToMorseCode(plain));
			});
			$(document).on('keypress', '#plain-input', function(event) {
				if(event.which == 13) {
					console.log('Enter');
					event.stopPropagation();
					morse.playInput();
					return false;
				}
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
				$(button).toggleClass('btn-outline-info btn-light');
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
			}
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
			$('.key-btn.btn-light').prop('disabled', true);
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
			var index = Math.floor(Math.random() * 26);
			return Array.from(morse.alphabet.keys())[index];
		},
		
		playInput : function() {
			var plain = $('#plain-input').val();
			var morseCode = morse.plainToMorseCode(plain);
			morse.play(morseCode);
		},
		
		clearInput : function() {
			$('#plain-input').val('').keyup();
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
					morseCode += letterSeparator;
				}
			} 
			morseCode = morseCode.replace(letterSeparator + wordSeparator, wordSeparator);
			return morseCode;
		},
		
		play : function(input) {
			var t = ctx.currentTime;
			var oscillator = ctx.createOscillator();   
			oscillator.type = 'sine';
		    oscillator.frequency.value = 600;    
		    
		    var gainNode = ctx.createGain();
		    gainNode.gain.setValueAtTime(0, t);
		    
		    var dot = 1.2 / morse.wpm;
		    
		    input.split('').forEach(function(letter) {
		        switch(letter) {
		            case '.':
		                gainNode.gain.setValueAtTime(1, t);
		                t += dot;
		                gainNode.gain.setValueAtTime(0, t);
		                t += dot;
		                break;
		            case '-':
		                gainNode.gain.setValueAtTime(1, t);
		                t += 3 * dot;
		                gainNode.gain.setValueAtTime(0, t);
		                t += dot;
		                break;
		            case letterSeparator:
		                t += 3 * dot;
		                break;
		            case wordSeparator:
		                t += 7 * dot;
		                break;
		        }
		    });

		    oscillator.connect(gainNode);
		    gainNode.connect(ctx.destination);
		    t = ctx.currentTime;

		    oscillator.start();

		    return false;
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