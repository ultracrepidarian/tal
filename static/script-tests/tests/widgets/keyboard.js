/**
 * @preserve Copyright (c) 2013 British Broadcasting Corporation
 * (http://www.bbc.co.uk) and TAL Contributors (1)
 *
 * (1) TAL Contributors are listed in the AUTHORS file and at
 *     https://github.com/fmtvp/TAL/AUTHORS - please extend this file,
 *     not this notice.
 *
 * @license Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * All rights reserved
 * Please contact us for an alternative licence
 */

(function() {

	var UPPERCASE = 0,
		LOWERCASE = 1,
		TITLECASE = 2;

	this.KeyboardTest = AsyncTestCase("Keyboard");

	this.KeyboardTest.prototype.setUp = function() {
		this.sandbox = sinon.sandbox.create();
	};

	this.KeyboardTest.prototype.tearDown = function() {
		this.sandbox.restore();
	};
	
	this.KeyboardTest.prototype.testSettingAndGettingOfMultiTap = function(queue) {
		expectAsserts(2);

		queuedApplicationInit(
			queue,
			"lib/mockapplication",
			["antie/widgets/keyboard"],
			function(application, Keyboard) {
				
				var keyboard = new Keyboard("id", 1, 1, ["a"]);

				keyboard.setMultiTap(true);
				assert(keyboard.getMultiTap());
				
				keyboard.setMultiTap(false);
				assertFalse(keyboard.getMultiTap());
		});
	
	};
	
	var _verifyButton = function (keyboard, button, expectedCol, expectedRow, expectedCharacter) {
		var expectedId = "id_" +expectedCharacter+ "_" +expectedCol+ "_" +expectedRow;
	
		assertEquals(expectedId, button.id);
		assert(button.hasClass("key" + expectedCharacter));
		assertEquals(expectedCharacter, button.getDataItem());
		assertEquals(keyboard.getWidgetAt(expectedCol, expectedRow), button);
	};
	
	this.KeyboardTest.prototype.testKeyboardBuiltWithCorrectNumberOfRowsAndCols = function (queue) {
		expectAsserts(25);

		queuedApplicationInit(
			queue,
			"lib/mockapplication",
			["antie/widgets/keyboard"],
			function(application, Keyboard) {
				var keyboard = new Keyboard("id", 3, 2, ["a", "b", "c",
														 "d", "e", "f"]);

 				assertEquals(6, keyboard.getChildWidgets().length);

				_verifyButton(keyboard, keyboard.getChildWidgets()[0], 0, 0, "a");
				_verifyButton(keyboard, keyboard.getChildWidgets()[1], 1, 0, "b");
				_verifyButton(keyboard, keyboard.getChildWidgets()[2], 2, 0, "c");
				_verifyButton(keyboard, keyboard.getChildWidgets()[3], 0, 1, "d");
				_verifyButton(keyboard, keyboard.getChildWidgets()[4], 1, 1, "e");
				_verifyButton(keyboard, keyboard.getChildWidgets()[5], 2, 1, "f");
		});
	};
	
	var _verifySpecialKeyBuildsCorrectly = function(queue, triggerCharacter, buttonText) {
		expectAsserts(3);

		queuedApplicationInit(
			queue,
			"lib/mockapplication",
			["antie/widgets/keyboard"],
			function(application, Keyboard) {
				var keyboard = new Keyboard("id", 1, 1, [triggerCharacter]);
				var firstButton = keyboard.getChildWidgets()[0];

				assertEquals("id_" +buttonText+ "_0_0", firstButton.id);				
 				assertEquals(buttonText, firstButton.getDataItem());
 				assertEquals(1, keyboard.getChildWidgets().length);
			});		
	};
	
	this.KeyboardTest.prototype.testKeyboardBuiltWithSpaceKey = function (queue) {
		_verifySpecialKeyBuildsCorrectly(queue, " ", "SPACE");
	};

	this.KeyboardTest.prototype.testKeyboardBuiltWithDelKey = function (queue) {
		_verifySpecialKeyBuildsCorrectly(queue, "-", "DEL");
	};
	
	this.KeyboardTest.prototype.testKeyboardBuiltWithEmptyNonFunctioningSpacer = function (queue) {
		expectAsserts(2);

		queuedApplicationInit(
			queue,
			"lib/mockapplication",
			["antie/widgets/keyboard"],
			function(application, Keyboard) {
				var keyboard = new Keyboard("id", 1, 1, ["_"]);
				var firstButton = keyboard.getChildWidgets()[0];

				assertNull(firstButton);
 				assertEquals(1, keyboard.getChildWidgets().length);
			});		
	};
	
	//text
		// text set correctly
		// set maxlength class if at maxlength and have focus on "-" key
		
	this.KeyboardTest.prototype.testSettingAndGettingOfText = function(queue) {
		expectAsserts(2);

		queuedApplicationInit(
			queue,
			"lib/mockapplication",
			["antie/widgets/keyboard"],
			function(application, Keyboard) {
				
				var someText = "some text";
				var someOtherText = "some text";
				var keyboard = new Keyboard("id", 1, 1, ["a"]);

				keyboard.setText(someText);
				assertEquals(someText, keyboard.getText());
				
				keyboard.setText(someOtherText);
				assertEquals(someOtherText, keyboard.getText());
		});
	};
		
	this.KeyboardTest.prototype.testSetTextAddsMaxLengthClassWhenNewTextIsMaxlength = function(queue) {
		expectAsserts(4);

		queuedApplicationInit(
			queue,
			"lib/mockapplication",
			["antie/widgets/keyboard"],
			function(application, Keyboard) {
			
				this.sandbox.spy(Keyboard.prototype, "setActiveChildKey");
				this.sandbox.spy(Keyboard.prototype, "removeClass");
			
				var keyboard = new Keyboard("id", 5, 1, ["a", "b", "c", "d", "e"]);				
				var maxLengthText = "abcde";				
				keyboard.setMaximumLength(5);

				assertFalse(keyboard.hasClass("maxlength"));

				keyboard.setText(maxLengthText);
				
				assertTrue(keyboard.hasClass("maxlength"));
				assert(Keyboard.prototype.setActiveChildKey.calledOnce);
				assertEquals("-", Keyboard.prototype.setActiveChildKey.args[0][0]);
		});
	};
	
	this.KeyboardTest.prototype.testSetTextRemovesMaxlengthClassWhenSetTextWithLengthLessThanMaxlength = function(queue) {
		expectAsserts(2);

		queuedApplicationInit(
			queue,
			"lib/mockapplication",
			["antie/widgets/keyboard"],
			function(application, Keyboard) {

				this.sandbox.spy(Keyboard.prototype, "removeClass");
			
				var keyboard = new Keyboard("id", 5, 1, ["a", "b", "c", "d", "e"]);
				var maxLengthText = "abcde";
				var notMaxLengthText = "abc";
				keyboard.setMaximumLength(5);

				keyboard.setText(maxLengthText);
				
				assertTrue(keyboard.hasClass("maxlength"));
				
				keyboard.setText(notMaxLengthText);
				
				assertFalse(keyboard.hasClass("maxlength"));
		});
	};
	
	this.KeyboardTest.prototype.testCaptilisationForcesUppercaseWhenUppercaseFlagSet = function(queue) {
		expectAsserts(1);
	
		queuedApplicationInit(
			queue,
			"lib/mockapplication",
			["antie/widgets/keyboard", "antie/events/keyevent", "antie/events/selectevent"],
			function(application, Keyboard, KeyEvent, SelectEvent) {
				var keyboard = new Keyboard("id", 3, 1, ["A", "B", "c"]);
				keyboard.setCapitalisation(UPPERCASE);
				keyboard.setText("AB");

				var buttonC = keyboard.getChildWidgets()[2];
				buttonC.bubbleEvent(new SelectEvent(buttonC));
				
				assertEquals("ABC", keyboard.getText());
		});
	};
	
	this.KeyboardTest.prototype.testCaptilisationForcesLowercaseWhenLowercaseFlagSet = function(queue) {
		expectAsserts(1);
	
		queuedApplicationInit(
			queue,
			"lib/mockapplication",
			["antie/widgets/keyboard", "antie/events/keyevent", "antie/events/selectevent"],
			function(application, Keyboard, KeyEvent, SelectEvent) {
				var keyboard = new Keyboard("id", 3, 1, ["a", "b", "C"]);
				keyboard.setCapitalisation(LOWERCASE);
				keyboard.setText("ab");

				var buttonC = keyboard.getChildWidgets()[2];
				buttonC.bubbleEvent(new SelectEvent(buttonC));
				
				assertEquals("abc", keyboard.getText());
		});

	};
	
	this.KeyboardTest.prototype.testCaptilisationForcesTitlecaseWhenTitlecaseFlagSet = function(queue) {
		expectAsserts(1);
	
		queuedApplicationInit(
			queue,
			"lib/mockapplication",
			["antie/widgets/keyboard", "antie/events/keyevent", "antie/events/selectevent"],
			function(application, Keyboard, KeyEvent, SelectEvent) {
				var keyboard = new Keyboard("id", 3, 1, ["a", "b", "C"]);
				keyboard.setCapitalisation(TITLECASE);
				keyboard.setText("ab");

				var buttonC = keyboard.getChildWidgets()[2];
				buttonC.bubbleEvent(new SelectEvent(buttonC));
				
				assertEquals("Abc", keyboard.getText());
		});
	};
	
})();

require(
	[
		"antie/widgets/keyboard",
		"antie/application",
		"antie/runtimecontext",
		"antie/devices/browserdevice",
		"antie/widgets/button",
		"antie/widgets/label",
		"antie/events/keyevent",
		"antie/events/textchangeevent",
		"antie/events/selectevent"
	],
	function (Keyboard, Application, RuntimeContext, Device, Button, Label, KeyEvent, TextChangeEvent, SelectEvent) {

		"use strict";

		var KEYS_CONFIG = {
			"map": {
				"27": "BACK",
				"114": "REWIND",
				"115": "FAST_FWD",
				"116": "STOP",
				"117": "PLAY_PAUSE",
				"40": "DOWN",
				"13": "ENTER",
				"98": "PAUSE",
				"32": "SPACE",
				"250": "PLAY",
				"39": "RIGHT",
				"38": "UP",
				"37": "LEFT",
				"120": "INFO",
				"121": "SUBTITLE"
			},
			"multitap": [
				"0 ",
				"1",
				"2ABC",
				"3DEF",
				"4GHI",
				"5JKL",
				"6MNO",
				"7PQRS",
				"8TUV",
				"9WXYZ"
			]
		};

		var sandbox, keyboard;

		testCase("KeyboardTest", {
			setUp: function () {
				sandbox = sinon.sandbox.create();

				sandbox.stub(Label.prototype);
				sandbox.stub(TextChangeEvent.prototype);

				var application = sinon.createStubInstance(Application);
				var device = sinon.createStubInstance(Device);
				application.getDevice.returns(device);
				sandbox.stub(RuntimeContext, "getCurrentApplication").returns(application);

				device.getConfig.returns({input: KEYS_CONFIG});
				device.arrayIndexOf = function (widgetArray, widget) {
						return widgetArray.indexOf(widget);
					};

				keyboard = this._newlyConstructedKeyboard();
			},

			tearDown: function () {
				sandbox.restore();
			},

			testConstructionOfKeyboard: function () {
				expectAsserts(1);

				assert(keyboard instanceof Keyboard);
			},

			testSettingMultiTapTrue: function () {
				expectAsserts(2);

				assertFalse(keyboard.getMultiTap());
				keyboard.setMultiTap(true);
				assertTrue(keyboard.getMultiTap());
			},

			testSettingMultiTapFalse: function () {
				expectAsserts(1);

				keyboard.setMultiTap(false);
				assertFalse(keyboard.getMultiTap());
			},

			testSettingText: function () {
				expectAsserts(2);

				assertSame("", keyboard.getText());
				keyboard.setText("KDIEO W203");
				assertSame("KDIEO W203", keyboard.getText());
			},

			testSettingCapitalisationToLowerCase: function () {
				expectAsserts(1);
				keyboard.setCapitalisation(Keyboard.CAPITALISATION_LOWER);
				assertEquals(1, keyboard.getCapitalisation());
			},

			testSettingCapitalisationToUpperCase: function () {
				expectAsserts(1);
				keyboard.setCapitalisation(Keyboard.CAPITALISATION_UPPER);
				assertEquals(0, keyboard.getCapitalisation());
			},

			testSettingCapitalisationToTitleCase: function () {
				expectAsserts(1);
				keyboard.setCapitalisation(Keyboard.CAPITALISATION_TITLE);
				assertEquals(2, keyboard.getCapitalisation());
			},

			testSettingTheActiveChildKeyToC: function () {
				expectAsserts(2);

				keyboard.setActiveChildKey("C");
				var activeKey = keyboard.getActiveChildWidget();

				assert(activeKey instanceof Button);
				assertEquals("test_keyboard_C_2_1", activeKey.id);
			},

			testSettingTheActiveChildKeyToS: function () {
				expectAsserts(2);

				keyboard.setActiveChildKey("S");
				var activeKey = keyboard.getActiveChildWidget();

				assert(activeKey instanceof Button);
				assertEquals("test_keyboard_S_8_2", activeKey.id);
			},

			testSettingFocusOnH: function () {
				expectAsserts(2);

				keyboard.setActiveChildKey("H");
				keyboard.focus(); //does not return true or false like other focus widget methods

				var focussedKey = keyboard.getActiveChildWidget();

				assert(focussedKey instanceof Button);
				assertEquals("test_keyboard_H_7_1", focussedKey.id);
			},

			testSettingFocusOnPeriod: function () {
				expectAsserts(2);

				keyboard.setActiveChildKey(".");
				keyboard.focus();

				var focussedKey = keyboard.getActiveChildWidget();

				assert(focussedKey instanceof Button);
				assertEquals("test_keyboard_._6_3", focussedKey.id);
			},

			testSetMaximumLength: function () {
				expectAsserts(2);

				assertEquals(null, keyboard.getMaximumLength()); //null means no limit
				keyboard.setMaximumLength(20);
				assertEquals(20, keyboard.getMaximumLength());
			},

			testAppendingCharacterInResponseToASelectEvent: function () {
				expectAsserts(2);

				assertSame("", keyboard.getText());
				var letter = new Button("test_keyboard_H_7_1");
				letter.setDataItem("H");
				var selectEvent = new SelectEvent(letter);
				keyboard.bubbleEvent(selectEvent);

				assertSame("H", keyboard.getText());
			},

			testAppendingCharacterWithLOWERCaseInResponseToASelectEvent: function () {
				expectAsserts(2);

				keyboard.setText("Start");
				assertSame("Start", keyboard.getText());

				keyboard.setCapitalisation(Keyboard.CAPITALISATION_LOWER);
				var letter = new Button("test_keyboard_S_8_2");
				letter.setDataItem("S");
				var selectEvent = new SelectEvent(letter);
				keyboard.bubbleEvent(selectEvent);

				assertSame("Starts", keyboard.getText());
			},

			testAppendingCharacterWithUPPERCaseInResponseToASelectEvent: function () {
				expectAsserts(2);

				keyboard.setText("Start");
				assertSame("Start", keyboard.getText());

				keyboard.setCapitalisation(Keyboard.CAPITALISATION_UPPER);
				var letter = new Button("test_keyboard_S_8_2");
				letter.setDataItem("S");
				var selectEvent = new SelectEvent(letter);
				keyboard.bubbleEvent(selectEvent);

				assertSame("StartS", keyboard.getText());
			},

			testAppendingCharacterWithTITLECaseInResponseToASelectEvent: function () {
				expectAsserts(3);

				keyboard.setText("Start");
				assertSame("Start", keyboard.getText());

				keyboard.setCapitalisation(Keyboard.CAPITALISATION_TITLE);
				var letter = new Button("test_keyboard_S_8_2");
				letter.setDataItem("S");
				var selectEvent = new SelectEvent(letter);
				keyboard.bubbleEvent(selectEvent);

				assertSame("Starts", keyboard.getText());

				keyboard.setText("Starts ");

				letter = new Button("test_keyboard_S_8_2");
				letter.setDataItem("S");
				selectEvent = new SelectEvent(letter);
				keyboard.bubbleEvent(selectEvent);

				assertSame("Starts S", keyboard.getText());
			},

			testAppendingCharacterInResponseToAKeydownEvent: function () {
				expectAsserts(3);

				assertSame("", keyboard.getText());
				var letter = KeyEvent.VK_0;
				var keyEvent = new KeyEvent("keydown", letter);

				keyboard.setMultiTap(false);
				keyboard.bubbleEvent(keyEvent);

				assertSame("0", keyboard.getText());
				keyboard.bubbleEvent(keyEvent);
				assertSame("00", keyboard.getText());
			},

			testAppendingCharacterInResponseToAKeydownEventWithMultiTapSetTrue: function () {
				expectAsserts(4);

				assertSame("", keyboard.getText());
				var letter = KeyEvent.VK_2;
				var keyEvent = new KeyEvent("keydown", letter);

				keyboard.setMultiTap(true);
				keyboard.bubbleEvent(keyEvent);

				assertSame("2", keyboard.getText());
				keyboard.bubbleEvent(keyEvent);
				assertSame("A", keyboard.getText());
				keyboard.bubbleEvent(keyEvent);
				assertSame("B", keyboard.getText());
			},

			_newlyConstructedKeyboard: function () {
				return new Keyboard("test_keyboard", 10, 4, [
					"1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
					"A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
					"K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
					"U", "V", "W", "X", "Y", "Z", ".", "'", "&dash;", "_"
				]);
			}

		});
	}
);
