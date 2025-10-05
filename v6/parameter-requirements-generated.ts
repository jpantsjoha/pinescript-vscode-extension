/**
 * AUTO-GENERATED: Pine Script v6 Parameter Requirements
 * Generated: 2025-10-03T16:24:53.887Z
 * Source: https://www.tradingview.com/pine-script-reference/v6/
 * Functions: 457
 */

export interface FunctionParameter {
  name: string;
  type: string;
  description?: string;
  optional: boolean;
  required: boolean;
  explicitlyOptional?: boolean;
  explicitlyRequired?: boolean;
}

export interface FunctionSignatureSpec {
  name: string;
  syntax: string;
  description?: string;
  requiredParams: string[];
  optionalParams: string[];
  signature: string;
  parameters: FunctionParameter[];
}

export const PINE_FUNCTIONS: Record<string, FunctionSignatureSpec> = {
  'alert': {
    name: 'alert',
    syntax: "alert(message, freq) → void",
    description: "Creates an alert trigger for an indicator or strategy, with a specified frequency, when called on the latest realtime bar. To activate alerts for a script containing calls to this function, open the \"Create Alert\" dialog box, then select the script name and \"Any alert() function call\" in the \"Condition\" section.",
    requiredParams: ["message"],
    optionalParams: ["freq"],
    signature: "alert(message, freq) → void",
    parameters: [
        {
          "name": "message",
          "type": "series string",
          "description": "The message to send when the alert occurs.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "freq",
          "type": "input string",
          "description": "Optional. Determines the allowed frequency of the alert trigger. Possible values are: alert.freq_all (allows an alert on any realtime update), alert.freq_once_per_bar (allows an alert only on the first execution for each realtime bar), or alert.freq_once_per_bar_close (allows an alert only when a realtime bar closes). The default is alert.freq_once_per_bar.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'alertcondition': {
    name: 'alertcondition',
    syntax: "alertcondition(condition, title, message) → void",
    description: "Creates alert condition, that is available in Create Alert dialog. Please note, that alertcondition does NOT create an alert, it just gives you more options in Create Alert dialog. Also, alertcondition effect is invisible on chart.",
    requiredParams: ["condition"],
    optionalParams: ["title","message"],
    signature: "alertcondition(condition, title, message) → void",
    parameters: [
        {
          "name": "condition",
          "type": "series bool",
          "description": "Series of boolean values that is used for alert. True values mean alert fire, false - no alert. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the alert condition. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "message",
          "type": "const string",
          "description": "Message to display when alert fires. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.abs': {
    name: 'array.abs',
    syntax: "array.abs(id) → array<float>",
    description: "Returns an array containing the absolute value of each element in the original array.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.abs(id) → array<float>",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.avg': {
    name: 'array.avg',
    syntax: "array.avg(id) → series float",
    description: "The function returns the mean of an array's elements.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.avg(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.binary_search': {
    name: 'array.binary_search',
    syntax: "array.binary_search(id, val) → series int",
    description: "The function returns the index of the value, or -1 if the value is not found. The array to search must be sorted in ascending order.",
    requiredParams: ["id"],
    optionalParams: ["val"],
    signature: "array.binary_search(id, val) → series int",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "val",
          "type": "series int/float",
          "description": "The value to search for in the array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.binary_search_leftmost': {
    name: 'array.binary_search_leftmost',
    syntax: "array.binary_search_leftmost(id, val) → series int",
    description: "The function returns the index of the value if it is found. When the value is not found, the function returns the index of the next smallest element to the left of where the value would lie if it was in the array. The array to search must be sorted in ascending order.",
    requiredParams: ["id"],
    optionalParams: ["val"],
    signature: "array.binary_search_leftmost(id, val) → series int",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "val",
          "type": "series int/float",
          "description": "The value to search for in the array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.binary_search_rightmost': {
    name: 'array.binary_search_rightmost',
    syntax: "array.binary_search_rightmost(id, val) → series int",
    description: "The function returns the index of the value if it is found. When the value is not found, the function returns the index of the element to the right of where the value would lie if it was in the array. The array must be sorted in ascending order.",
    requiredParams: ["id"],
    optionalParams: ["val"],
    signature: "array.binary_search_rightmost(id, val) → series int",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "val",
          "type": "series int/float",
          "description": "The value to search for in the array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.clear': {
    name: 'array.clear',
    syntax: "array.clear(id) → void",
    description: "The function removes all elements from an array.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.clear(id) → void",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.concat': {
    name: 'array.concat',
    syntax: "array.concat(id1, id2) → array<type>",
    description: "The function is used to merge two arrays. It pushes all elements from the second array to the first array, and returns the first array.",
    requiredParams: ["id1"],
    optionalParams: ["id2"],
    signature: "array.concat(id1, id2) → array<type>",
    parameters: [
        {
          "name": "id1",
          "type": "any array type",
          "description": "The first array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "id2",
          "type": "any array type",
          "description": "The second array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.copy': {
    name: 'array.copy',
    syntax: "array.copy(id) → array<type>",
    description: "The function creates a copy of an existing array.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.copy(id) → array<type>",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.covariance': {
    name: 'array.covariance',
    syntax: "array.covariance(id1, id2, biased) → series float",
    description: "The function returns the covariance of two arrays.",
    requiredParams: ["id1"],
    optionalParams: ["id2","biased"],
    signature: "array.covariance(id1, id2, biased) → series float",
    parameters: [
        {
          "name": "id1",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "id2",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "biased",
          "type": "series bool",
          "description": "Determines which estimate should be used. Optional. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.every': {
    name: 'array.every',
    syntax: "array.every(id) → series bool",
    description: "Returns true if all elements of the id array are true, false otherwise.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.every(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "array<bool>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.fill': {
    name: 'array.fill',
    syntax: "array.fill(id, value, index_from, index_to) → void",
    description: "The function sets elements of an array to a single value. If no index is specified, all elements are set. If only a start index (default 0) is supplied, the elements starting at that index are set. If both index parameters are used, the elements from the starting index up to but not including the end index (default na) are set.",
    requiredParams: ["id"],
    optionalParams: ["value","index_from","index_to"],
    signature: "array.fill(id, value, index_from, index_to) → void",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "value",
          "type": "series <type of the array's elements>",
          "description": "Value to fill the array with.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "index_from",
          "type": "series int",
          "description": "Start index, default is 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "index_to",
          "type": "series int",
          "description": "End index, default is na. Must be one greater than the index of the last element to set.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.first': {
    name: 'array.first',
    syntax: "array.first(id) → series <type>",
    description: "Returns the array's first element. Throws a runtime error if the array is empty.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.first(id) → series <type>",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.from': {
    name: 'array.from',
    syntax: "array.from(arg0, arg1, ...) → array<type>",
    description: "The function takes a variable number of arguments with one of the types: int, float, bool, string, label, line, color, box, table, linefill, and returns an array of the corresponding type.",
    requiredParams: [],
    optionalParams: [],
    signature: "array.from(arg0, arg1, ...) → array<type>",
    parameters: []
  },
  'array.get': {
    name: 'array.get',
    syntax: "array.get(id, index) → series <type>",
    description: "The function returns the value of the element at the specified index.",
    requiredParams: ["id"],
    optionalParams: ["index"],
    signature: "array.get(id, index) → series <type>",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "index",
          "type": "series int",
          "description": "The index of the element whose value is to be returned.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.includes': {
    name: 'array.includes',
    syntax: "array.includes(id, value) → series bool",
    description: "The function returns true if the value was found in an array, false otherwise.",
    requiredParams: ["id"],
    optionalParams: ["value"],
    signature: "array.includes(id, value) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "value",
          "type": "series <type of the array's elements>",
          "description": "The value to search in the array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.indexof': {
    name: 'array.indexof',
    syntax: "array.indexof(id, value) → series int",
    description: "The function returns the index of the first occurrence of the value, or -1 if the value is not found.",
    requiredParams: ["id"],
    optionalParams: ["value"],
    signature: "array.indexof(id, value) → series int",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "value",
          "type": "series <type of the array's elements>",
          "description": "The value to search in the array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.insert': {
    name: 'array.insert',
    syntax: "array.insert(id, index, value) → void",
    description: "The function changes the contents of an array by adding new elements in place.",
    requiredParams: ["id"],
    optionalParams: ["index","value"],
    signature: "array.insert(id, index, value) → void",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "index",
          "type": "series int",
          "description": "The index at which to insert the value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "value",
          "type": "series <type of the array's elements>",
          "description": "The value to add to the array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.join': {
    name: 'array.join',
    syntax: "array.join(id, separator) → series string",
    description: "The function creates and returns a new string by concatenating all the elements of an array, separated by the specified separator string.",
    requiredParams: ["id"],
    optionalParams: ["separator"],
    signature: "array.join(id, separator) → series string",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float/string>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "separator",
          "type": "series string",
          "description": "The string used to separate each array element.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.last': {
    name: 'array.last',
    syntax: "array.last(id) → series <type>",
    description: "Returns the array's last element. Throws a runtime error if the array is empty.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.last(id) → series <type>",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.lastindexof': {
    name: 'array.lastindexof',
    syntax: "array.lastindexof(id, value) → series int",
    description: "The function returns the index of the last occurrence of the value, or -1 if the value is not found.",
    requiredParams: ["id"],
    optionalParams: ["value"],
    signature: "array.lastindexof(id, value) → series int",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "value",
          "type": "series <type of the array's elements>",
          "description": "The value to search in the array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.max': {
    name: 'array.max',
    syntax: "array.max(id, nth) → series float",
    description: "The function returns the greatest value, or the nth greatest value in a given array.",
    requiredParams: ["id"],
    optionalParams: ["nth"],
    signature: "array.max(id, nth) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "nth",
          "type": "series int",
          "description": "The nth greatest value to return, where zero is the greatest. Optional. The default is zero.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.median': {
    name: 'array.median',
    syntax: "array.median(id) → series float",
    description: "The function returns the median of an array's elements.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.median(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.min': {
    name: 'array.min',
    syntax: "array.min(id, nth) → series float",
    description: "The function returns the smallest value, or the nth smallest value in a given array.",
    requiredParams: ["id"],
    optionalParams: ["nth"],
    signature: "array.min(id, nth) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "nth",
          "type": "series int",
          "description": "The nth smallest value to return, where zero is the smallest. Optional. The default is zero.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.mode': {
    name: 'array.mode',
    syntax: "array.mode(id) → series float",
    description: "The function returns the mode of an array's elements. If there are several values with the same frequency, it returns the smallest value.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.mode(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.new_bool': {
    name: 'array.new_bool',
    syntax: "array.new_bool(size, initial_value) → array<bool>",
    description: "The function creates a new array object of bool type elements.",
    requiredParams: [],
    optionalParams: ["size","initial_value"],
    signature: "array.new_bool(size, initial_value) → array<bool>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "series bool",
          "description": "Initial value of all array elements. Optional. The default is 'false'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.new_box': {
    name: 'array.new_box',
    syntax: "array.new_box(size, initial_value) → array<box>",
    description: "The function creates a new array object of box type elements.",
    requiredParams: [],
    optionalParams: ["size","initial_value"],
    signature: "array.new_box(size, initial_value) → array<box>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "series box",
          "description": "Initial value of all array elements. Optional. The default is 'na'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.new_color': {
    name: 'array.new_color',
    syntax: "array.new_color(size, initial_value) → array<color>",
    description: "The function creates a new array object of color type elements.",
    requiredParams: [],
    optionalParams: ["size","initial_value"],
    signature: "array.new_color(size, initial_value) → array<color>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "series color",
          "description": "Initial value of all array elements. Optional. The default is 'na'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.new_float': {
    name: 'array.new_float',
    syntax: "array.new_float(size, initial_value) → array<float>",
    description: "The function creates a new array object of float type elements.",
    requiredParams: [],
    optionalParams: ["size","initial_value"],
    signature: "array.new_float(size, initial_value) → array<float>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "series int/float",
          "description": "Initial value of all array elements. Optional. The default is 'na'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.new_int': {
    name: 'array.new_int',
    syntax: "array.new_int(size, initial_value) → array<int>",
    description: "The function creates a new array object of int type elements.",
    requiredParams: [],
    optionalParams: ["size","initial_value"],
    signature: "array.new_int(size, initial_value) → array<int>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "series int",
          "description": "Initial value of all array elements. Optional. The default is 'na'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.new_label': {
    name: 'array.new_label',
    syntax: "array.new_label(size, initial_value) → array<label>",
    description: "The function creates a new array object of label type elements.",
    requiredParams: [],
    optionalParams: ["size","initial_value"],
    signature: "array.new_label(size, initial_value) → array<label>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "series label",
          "description": "Initial value of all array elements. Optional. The default is 'na'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.new_line': {
    name: 'array.new_line',
    syntax: "array.new_line(size, initial_value) → array<line>",
    description: "The function creates a new array object of line type elements.",
    requiredParams: [],
    optionalParams: ["size","initial_value"],
    signature: "array.new_line(size, initial_value) → array<line>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "series line",
          "description": "Initial value of all array elements. Optional. The default is 'na'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.new_linefill': {
    name: 'array.new_linefill',
    syntax: "array.new_linefill(size, initial_value) → array<linefill>",
    description: "The function creates a new array object of linefill type elements.",
    requiredParams: ["size"],
    optionalParams: ["initial_value"],
    signature: "array.new_linefill(size, initial_value) → array<linefill>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "initial_value",
          "type": "series linefill",
          "description": "Initial value of all array elements.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.new_string': {
    name: 'array.new_string',
    syntax: "array.new_string(size, initial_value) → array<string>",
    description: "The function creates a new array object of string type elements.",
    requiredParams: [],
    optionalParams: ["size","initial_value"],
    signature: "array.new_string(size, initial_value) → array<string>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "series string",
          "description": "Initial value of all array elements. Optional. The default is 'na'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.new_table': {
    name: 'array.new_table',
    syntax: "array.new_table(size, initial_value) → array<table>",
    description: "The function creates a new array object of table type elements.",
    requiredParams: [],
    optionalParams: ["size","initial_value"],
    signature: "array.new_table(size, initial_value) → array<table>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "series table",
          "description": "Initial value of all array elements. Optional. The default is 'na'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.new<type>': {
    name: 'array.new<type>',
    syntax: "array.new<type>(size, initial_value) → array<type>",
    description: "The function creates a new array object of <type> elements.",
    requiredParams: [],
    optionalParams: ["size","initial_value"],
    signature: "array.new<type>(size, initial_value) → array<type>",
    parameters: [
        {
          "name": "size",
          "type": "series int",
          "description": "Initial size of an array. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "<array_type>",
          "description": "Initial value of all array elements. Optional. The default is 'na'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.percentile_linear_interpolation': {
    name: 'array.percentile_linear_interpolation',
    syntax: "array.percentile_linear_interpolation(id, percentage) → series float",
    description: "Returns the value for which the specified percentage of array values (percentile) are less than or equal to it, using linear interpolation.",
    requiredParams: ["id"],
    optionalParams: ["percentage"],
    signature: "array.percentile_linear_interpolation(id, percentage) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "percentage",
          "type": "series int/float",
          "description": "The percentage of values that must be equal or less than the returned value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.percentile_nearest_rank': {
    name: 'array.percentile_nearest_rank',
    syntax: "array.percentile_nearest_rank(id, percentage) → series float",
    description: "Returns the value for which the specified percentage of array values (percentile) are less than or equal to it, using the nearest-rank method.",
    requiredParams: ["id"],
    optionalParams: ["percentage"],
    signature: "array.percentile_nearest_rank(id, percentage) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "percentage",
          "type": "series int/float",
          "description": "The percentage of values that must be equal or less than the returned value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.percentrank': {
    name: 'array.percentrank',
    syntax: "array.percentrank(id, index) → series float",
    description: "Returns the percentile rank of the element at the specified index.",
    requiredParams: ["id"],
    optionalParams: ["index"],
    signature: "array.percentrank(id, index) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "index",
          "type": "series int",
          "description": "The index of the element for which the percentile rank should be calculated.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.pop': {
    name: 'array.pop',
    syntax: "array.pop(id) → series <type>",
    description: "The function removes the last element from an array and returns its value.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.pop(id) → series <type>",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.push': {
    name: 'array.push',
    syntax: "array.push(id, value) → void",
    description: "The function appends a value to an array.",
    requiredParams: ["id"],
    optionalParams: ["value"],
    signature: "array.push(id, value) → void",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "value",
          "type": "series <type of the array's elements>",
          "description": "The value of the element added to the end of the array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.range': {
    name: 'array.range',
    syntax: "array.range(id) → series float",
    description: "The function returns the difference between the min and max values from a given array.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.range(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.remove': {
    name: 'array.remove',
    syntax: "array.remove(id, index) → series <type>",
    description: "The function changes the contents of an array by removing the element with the specified index.",
    requiredParams: ["id"],
    optionalParams: ["index"],
    signature: "array.remove(id, index) → series <type>",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "index",
          "type": "series int",
          "description": "The index of the element to remove.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.reverse': {
    name: 'array.reverse',
    syntax: "array.reverse(id) → void",
    description: "The function reverses an array. The first array element becomes the last, and the last array element becomes the first.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.reverse(id) → void",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.set': {
    name: 'array.set',
    syntax: "array.set(id, index, value) → void",
    description: "The function sets the value of the element at the specified index.",
    requiredParams: ["id"],
    optionalParams: ["index","value"],
    signature: "array.set(id, index, value) → void",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "index",
          "type": "series int",
          "description": "The index of the element to be modified.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "value",
          "type": "series <type of the array's elements>",
          "description": "The new value to be set.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.shift': {
    name: 'array.shift',
    syntax: "array.shift(id) → series <type>",
    description: "The function removes an array's first element and returns its value.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.shift(id) → series <type>",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.size': {
    name: 'array.size',
    syntax: "array.size(id) → series int",
    description: "The function returns the number of elements in an array.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.size(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.slice': {
    name: 'array.slice',
    syntax: "array.slice(id, index_from, index_to) → array<type>",
    description: "The function creates a slice from an existing array. If an object from the slice changes, the changes are applied to both the new and the original arrays.",
    requiredParams: ["id"],
    optionalParams: ["index_from","index_to"],
    signature: "array.slice(id, index_from, index_to) → array<type>",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "index_from",
          "type": "series int",
          "description": "Zero-based index at which to begin extraction.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "index_to",
          "type": "series int",
          "description": "Zero-based index before which to end extraction. The function extracts up to but not including the element with this index.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.some': {
    name: 'array.some',
    syntax: "array.some(id) → series bool",
    description: "Returns true if at least one element of the id array is true, false otherwise.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.some(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "array<bool>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.sort': {
    name: 'array.sort',
    syntax: "array.sort(id, order) → void",
    description: "The function sorts the elements of an array.",
    requiredParams: ["id"],
    optionalParams: ["order"],
    signature: "array.sort(id, order) → void",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float/string>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "order",
          "type": "series sort_order",
          "description": "The sort order: order.ascending (default) or order.descending.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.sort_indices': {
    name: 'array.sort_indices',
    syntax: "array.sort_indices(id, order) → array<int>",
    description: "Returns an array of indices which, when used to index the original array, will access its elements in their sorted order. It does not modify the original array.",
    requiredParams: ["id"],
    optionalParams: ["order"],
    signature: "array.sort_indices(id, order) → array<int>",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float/string>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "order",
          "type": "series sort_order",
          "description": "The sort order: order.ascending or order.descending. Optional. The default is order.ascending.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.standardize': {
    name: 'array.standardize',
    syntax: "array.standardize(id) → array<float>",
    description: "The function returns the array of standardized elements.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.standardize(id) → array<float>",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.stdev': {
    name: 'array.stdev',
    syntax: "array.stdev(id, biased) → series float",
    description: "The function returns the standard deviation of an array's elements.",
    requiredParams: ["id"],
    optionalParams: ["biased"],
    signature: "array.stdev(id, biased) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "biased",
          "type": "series bool",
          "description": "Determines which estimate should be used. Optional. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'array.sum': {
    name: 'array.sum',
    syntax: "array.sum(id) → series float",
    description: "The function returns the sum of an array's elements.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "array.sum(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'array.unshift': {
    name: 'array.unshift',
    syntax: "array.unshift(id, value) → void",
    description: "The function inserts the value at the beginning of the array.",
    requiredParams: ["id"],
    optionalParams: ["value"],
    signature: "array.unshift(id, value) → void",
    parameters: [
        {
          "name": "id",
          "type": "any array type",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "value",
          "type": "series <type of the array's elements>",
          "description": "The value to add to the start of the array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'array.variance': {
    name: 'array.variance',
    syntax: "array.variance(id, biased) → series float",
    description: "The function returns the variance of an array's elements.",
    requiredParams: ["id"],
    optionalParams: ["biased"],
    signature: "array.variance(id, biased) → series float",
    parameters: [
        {
          "name": "id",
          "type": "array<int/float>",
          "description": "An array object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "biased",
          "type": "series bool",
          "description": "Determines which estimate should be used. Optional. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'barcolor': {
    name: 'barcolor',
    syntax: "barcolor(color, offset, editable, show_last, title, display) → void",
    description: "Set color of bars.",
    requiredParams: ["color"],
    optionalParams: ["offset","editable","show_last","title","display"],
    signature: "barcolor(color, offset, editable, show_last, title, display) → void",
    parameters: [
        {
          "name": "color",
          "type": "series color",
          "description": "Color of bars. You can use constants like 'red' or '#ff001a' as well as complex expressions like 'close >= open ? color.green : color.red'. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "offset",
          "type": "simple int",
          "description": "Shifts the color series to the left or to the right on the given number of bars. Default is 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "editable",
          "type": "input bool",
          "description": "If true then barcolor style will be editable in Format dialog. Default is true.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "show_last",
          "type": "input int",
          "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the barcolor. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "display",
          "type": "input plot_simple_display",
          "description": "Controls where the barcolor is displayed. Possible values are: display.none, display.all. Default is display.all.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'bgcolor': {
    name: 'bgcolor',
    syntax: "bgcolor(color, offset, editable, show_last, title, display, force_overlay) → void",
    description: "Fill background of bars with specified color.",
    requiredParams: ["color"],
    optionalParams: ["offset","editable","show_last","title","display","force_overlay"],
    signature: "bgcolor(color, offset, editable, show_last, title, display, force_overlay) → void",
    parameters: [
        {
          "name": "color",
          "type": "series color",
          "description": "Color of the filled background. You can use constants like 'red' or '#ff001a' as well as complex expressions like 'close >= open ? color.green : color.red'. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "offset",
          "type": "simple int",
          "description": "Shifts the color series to the left or to the right on the given number of bars. Default is 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "editable",
          "type": "input bool",
          "description": "If true then bgcolor style will be editable in Format dialog. Default is true.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "show_last",
          "type": "input int",
          "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the bgcolor. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "display",
          "type": "input plot_simple_display",
          "description": "Controls where the bgcolor is displayed. Possible values are: display.none, display.all. Default is display.all.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'bool': {
    name: 'bool',
    syntax: "bool(x) → const bool",
    description: "Converts the x value to a bool value. Returns false if x is na, false, or an int/float value equal to 0. Returns true for all other possible values.",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "bool(x) → const bool",
    parameters: [
        {
          "name": "x",
          "type": "simple int/float/bool",
          "description": "The value to convert to the specified type, usually na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'box': {
    name: 'box',
    syntax: "box(x) → series box",
    description: "Casts na to box.",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "box(x) → series box",
    parameters: [
        {
          "name": "x",
          "type": "series box",
          "description": "The value to convert to the specified type, usually na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'box.copy': {
    name: 'box.copy',
    syntax: "box.copy(id) → series box",
    description: "Clones the box object.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "box.copy(id) → series box",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "Box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'box.delete': {
    name: 'box.delete',
    syntax: "box.delete(id) → void",
    description: "Deletes the specified box object. If it has already been deleted, does nothing.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "box.delete(id) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object to delete.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'box.get_bottom': {
    name: 'box.get_bottom',
    syntax: "box.get_bottom(id) → series float",
    description: "Returns the price value of the bottom border of the box.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "box.get_bottom(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'box.get_left': {
    name: 'box.get_left',
    syntax: "box.get_left(id) → series int",
    description: "Returns the bar index or the UNIX time (depending on the last value used for 'xloc') of the left border of the box.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "box.get_left(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'box.get_right': {
    name: 'box.get_right',
    syntax: "box.get_right(id) → series int",
    description: "Returns the bar index or the UNIX time (depending on the last value used for 'xloc') of the right border of the box.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "box.get_right(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'box.get_top': {
    name: 'box.get_top',
    syntax: "box.get_top(id) → series float",
    description: "Returns the price value of the top border of the box.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "box.get_top(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'box.new': {
    name: 'box.new',
    syntax: "box.new(top_left, bottom_right, border_color, border_width, border_style, extend, xloc, bgcolor, text, text_size, text_color, text_halign, text_valign, text_wrap, text_font_family, force_overlay, text_formatting) → series box",
    description: "Creates a new box object.",
    requiredParams: ["top_left"],
    optionalParams: ["bottom_right","border_color","border_width","border_style","extend","xloc","bgcolor","text","text_size","text_color","text_halign","text_valign","text_wrap","text_font_family","force_overlay","text_formatting"],
    signature: "box.new(top_left, bottom_right, border_color, border_width, border_style, extend, xloc, bgcolor, text, text_size, text_color, text_halign, text_valign, text_wrap, text_font_family, force_overlay, text_formatting) → series box",
    parameters: [
        {
          "name": "top_left",
          "type": "chart.point",
          "description": "A chart.point object that specifies the top-left corner location of the box.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "bottom_right",
          "type": "chart.point",
          "description": "A chart.point object that specifies the bottom-right corner location of the box.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "border_color",
          "type": "series color",
          "description": "Color of the four borders. Optional. The default is color.blue.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "border_width",
          "type": "series int",
          "description": "Width of the four borders, in pixels. Optional. The default is 1 pixel.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "border_style",
          "type": "series string",
          "description": "Style of the four borders. Possible values: line.style_solid, line.style_dotted, line.style_dashed. Optional. The default value is line.style_solid.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "extend",
          "type": "series string",
          "description": "When extend.none is used, the horizontal borders start at the left border and end at the right border. With extend.left or extend.right, the horizontal borders are extended indefinitely to the left or right of the box, respectively. With extend.both, the horizontal borders are extended on both sides. Optional. The default value is extend.none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "xloc",
          "type": "series string",
          "description": "Determines whether the arguments to 'left' and 'right' are a bar index or a time value. If xloc = xloc.bar_index, the arguments must be a bar index. If xloc = xloc.bar_time, the arguments must be a UNIX time. Possible values: xloc.bar_index and xloc.bar_time. Optional. The default is xloc.bar_index.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "bgcolor",
          "type": "series color",
          "description": "Background color of the box. Optional. The default is color.blue.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text",
          "type": "series string",
          "description": "The text to be displayed inside the box. Optional. The default is empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_size",
          "type": "series int/string",
          "description": "Optional. Size of the box's text. The size can be any positive integer, or one of the size.* built-in constant strings. The constant strings and their equivalent integer values are: size.auto (0), size.tiny (8), size.small (10), size.normal (14), size.large (20), size.huge (36). The default value is size.auto or 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_color",
          "type": "series color",
          "description": "The color of the text. Optional. The default is color.black.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_halign",
          "type": "series string",
          "description": "The horizontal alignment of the box's text. Optional. The default value is text.align_center. Possible values: text.align_left, text.align_center, text.align_right.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_valign",
          "type": "series string",
          "description": "The vertical alignment of the box's text. Optional. The default value is text.align_center. Possible values: text.align_top, text.align_center, text.align_bottom.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_wrap",
          "type": "series string",
          "description": "Optional. Whether to wrap text. Wrapped text starts a new line when it reaches the side of the box. Wrapped text lower than the bottom of the box is not displayed. Unwrapped text stays on a single line and is displayed past the width of the box if it is too long. If the text_size is 0 or text.wrap_auto, this setting has no effect. The default value is text.wrap_none. Possible values: text.wrap_none, text.wrap_auto.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_font_family",
          "type": "series string",
          "description": "The font family of the text. Optional. The default value is font.family_default. Possible values: font.family_default, font.family_monospace.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the drawing will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_formatting",
          "type": "const text_format",
          "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'box.set_bgcolor': {
    name: 'box.set_bgcolor',
    syntax: "box.set_bgcolor(id, color) → void",
    description: "Sets the background color of the box.",
    requiredParams: ["id"],
    optionalParams: ["color"],
    signature: "box.set_bgcolor(id, color) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "color",
          "type": "series color",
          "description": "New background color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_border_color': {
    name: 'box.set_border_color',
    syntax: "box.set_border_color(id, color) → void",
    description: "Sets the border color of the box.",
    requiredParams: ["id"],
    optionalParams: ["color"],
    signature: "box.set_border_color(id, color) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "color",
          "type": "series color",
          "description": "New border color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_border_style': {
    name: 'box.set_border_style',
    syntax: "box.set_border_style(id, style) → void",
    description: "Sets the border style of the box.",
    requiredParams: ["id"],
    optionalParams: ["style"],
    signature: "box.set_border_style(id, style) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "style",
          "type": "series string",
          "description": "New border style.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_border_width': {
    name: 'box.set_border_width',
    syntax: "box.set_border_width(id, width) → void",
    description: "Sets the border width of the box.",
    requiredParams: ["id"],
    optionalParams: ["width"],
    signature: "box.set_border_width(id, width) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "width",
          "type": "series int",
          "description": "Width of the four borders, in pixels.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_bottom': {
    name: 'box.set_bottom',
    syntax: "box.set_bottom(id, bottom) → void",
    description: "Sets the bottom coordinate of the box.",
    requiredParams: ["id"],
    optionalParams: ["bottom"],
    signature: "box.set_bottom(id, bottom) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "bottom",
          "type": "series int/float",
          "description": "Price value of the bottom border.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_bottom_right_point': {
    name: 'box.set_bottom_right_point',
    syntax: "box.set_bottom_right_point(id, point) → void",
    description: "Sets the bottom-right corner location of the id box to point.",
    requiredParams: ["id"],
    optionalParams: ["point"],
    signature: "box.set_bottom_right_point(id, point) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "point",
          "type": "chart.point",
          "description": "A chart.point object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_extend': {
    name: 'box.set_extend',
    syntax: "box.set_extend(id, extend) → void",
    description: "Sets extending type of the border of this box object. When extend.none is used, the horizontal borders start at the left border and end at the right border. With extend.left or extend.right, the horizontal borders are extended indefinitely to the left or right of the box, respectively. With extend.both, the horizontal borders are extended on both sides.",
    requiredParams: ["id"],
    optionalParams: ["extend"],
    signature: "box.set_extend(id, extend) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "extend",
          "type": "series string",
          "description": "New extending type.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_left': {
    name: 'box.set_left',
    syntax: "box.set_left(id, left) → void",
    description: "Sets the left coordinate of the box.",
    requiredParams: ["id"],
    optionalParams: ["left"],
    signature: "box.set_left(id, left) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "left",
          "type": "series int",
          "description": "Bar index or bar time of the left border. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_lefttop': {
    name: 'box.set_lefttop',
    syntax: "box.set_lefttop(id, left, top) → void",
    description: "Sets the left and top coordinates of the box.",
    requiredParams: ["id"],
    optionalParams: ["left","top"],
    signature: "box.set_lefttop(id, left, top) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "left",
          "type": "series int",
          "description": "Bar index or bar time of the left border.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "top",
          "type": "series int/float",
          "description": "Price value of the top border.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_right': {
    name: 'box.set_right',
    syntax: "box.set_right(id, right) → void",
    description: "Sets the right coordinate of the box.",
    requiredParams: ["id"],
    optionalParams: ["right"],
    signature: "box.set_right(id, right) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "right",
          "type": "series int",
          "description": "Bar index or bar time of the right border. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_rightbottom': {
    name: 'box.set_rightbottom',
    syntax: "box.set_rightbottom(id, right, bottom) → void",
    description: "Sets the right and bottom coordinates of the box.",
    requiredParams: ["id"],
    optionalParams: ["right","bottom"],
    signature: "box.set_rightbottom(id, right, bottom) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "right",
          "type": "series int",
          "description": "Bar index or bar time of the right border.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "bottom",
          "type": "series int/float",
          "description": "Price value of the bottom border.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_text': {
    name: 'box.set_text',
    syntax: "box.set_text(id, text) → void",
    description: "The function sets the text in the box.",
    requiredParams: ["id"],
    optionalParams: ["text"],
    signature: "box.set_text(id, text) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text",
          "type": "series string",
          "description": "The text to be displayed inside the box.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_text_color': {
    name: 'box.set_text_color',
    syntax: "box.set_text_color(id, text_color) → void",
    description: "The function sets the color of the text inside the box.",
    requiredParams: ["id"],
    optionalParams: ["text_color"],
    signature: "box.set_text_color(id, text_color) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text_color",
          "type": "series color",
          "description": "The color of the text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_text_font_family': {
    name: 'box.set_text_font_family',
    syntax: "box.set_text_font_family(id, text_font_family) → void",
    description: "The function sets the font family of the text inside the box.",
    requiredParams: ["id"],
    optionalParams: ["text_font_family"],
    signature: "box.set_text_font_family(id, text_font_family) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text_font_family",
          "type": "series string",
          "description": "The font family of the text. Possible values: font.family_default, font.family_monospace.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_text_formatting': {
    name: 'box.set_text_formatting',
    syntax: "box.set_text_formatting(id, text_formatting) → void",
    description: "Sets the formatting attributes the drawing applies to displayed text.",
    requiredParams: ["id"],
    optionalParams: ["text_formatting"],
    signature: "box.set_text_formatting(id, text_formatting) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text_formatting",
          "type": "const text_format",
          "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'box.set_text_halign': {
    name: 'box.set_text_halign',
    syntax: "box.set_text_halign(id, text_halign) → void",
    description: "The function sets the horizontal alignment of the box's text.",
    requiredParams: ["id"],
    optionalParams: ["text_halign"],
    signature: "box.set_text_halign(id, text_halign) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text_halign",
          "type": "series string",
          "description": "The horizontal alignment of a box's text. Possible values: text.align_left, text.align_center, text.align_right.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_text_size': {
    name: 'box.set_text_size',
    syntax: "box.set_text_size(id, text_size) → void",
    description: "The function sets the size of the box's text.",
    requiredParams: ["id"],
    optionalParams: ["text_size"],
    signature: "box.set_text_size(id, text_size) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text_size",
          "type": "series int/string",
          "description": "Size of the box's text. The size can be any positive integer, or one of the size.* built-in constant strings. The constant strings and their equivalent integer values are: size.auto (0), size.tiny (8), size.small (10), size.normal (14), size.large (20), size.huge (36).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_text_valign': {
    name: 'box.set_text_valign',
    syntax: "box.set_text_valign(id, text_valign) → void",
    description: "The function sets the vertical alignment of a box's text.",
    requiredParams: ["id"],
    optionalParams: ["text_valign"],
    signature: "box.set_text_valign(id, text_valign) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text_valign",
          "type": "series string",
          "description": "The vertical alignment of the box's text. Possible values: text.align_top, text.align_center, text.align_bottom.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_text_wrap': {
    name: 'box.set_text_wrap',
    syntax: "box.set_text_wrap(id, text_wrap) → void",
    description: "The function sets the mode of wrapping of the text inside the box.",
    requiredParams: ["id"],
    optionalParams: ["text_wrap"],
    signature: "box.set_text_wrap(id, text_wrap) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text_wrap",
          "type": "series string",
          "description": "Whether to wrap text. Wrapped text starts a new line when it reaches the side of the box. Wrapped text lower than the bottom of the box is not displayed. Unwrapped text stays on a single line and is displayed past the width of the box if it is too long. If the text_size is 0 or text.wrap_auto, this setting has no effect. Possible values: text.wrap_none, text.wrap_auto.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_top': {
    name: 'box.set_top',
    syntax: "box.set_top(id, top) → void",
    description: "Sets the top coordinate of the box.",
    requiredParams: ["id"],
    optionalParams: ["top"],
    signature: "box.set_top(id, top) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "top",
          "type": "series int/float",
          "description": "Price value of the top border.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_top_left_point': {
    name: 'box.set_top_left_point',
    syntax: "box.set_top_left_point(id, point) → void",
    description: "Sets the top-left corner location of the id box to point.",
    requiredParams: ["id"],
    optionalParams: ["point"],
    signature: "box.set_top_left_point(id, point) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "A box object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "point",
          "type": "chart.point",
          "description": "A chart.point object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'box.set_xloc': {
    name: 'box.set_xloc',
    syntax: "box.set_xloc(id, left, right, xloc) → void",
    description: "Sets the left and right borders of a box and updates its xloc property.",
    requiredParams: ["id"],
    optionalParams: ["left","right","xloc"],
    signature: "box.set_xloc(id, left, right, xloc) → void",
    parameters: [
        {
          "name": "id",
          "type": "series box",
          "description": "The ID of the box object to update.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "left",
          "type": "series int",
          "description": "The bar index or timestamp for the left border of the box.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "right",
          "type": "series int",
          "description": "The bar index or timestamp for the right border of the box.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "xloc",
          "type": "series string",
          "description": "Determines whether the box treats the left and right arguments as bar indices or timestamps. Possible values: xloc.bar_index and xloc.bar_time. If the value is xloc.bar_index, the arguments represent bar indices. If xloc.bar_time, the arguments represent UNIX timestamps.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'chart.point.copy': {
    name: 'chart.point.copy',
    syntax: "chart.point.copy(id) → chart.point",
    description: "Creates a copy of a chart.point object with the specified id.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "chart.point.copy(id) → chart.point",
    parameters: [
        {
          "name": "id",
          "type": "chart.point",
          "description": "A chart.point object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'chart.point.from_index': {
    name: 'chart.point.from_index',
    syntax: "chart.point.from_index(index, price) → chart.point",
    description: "Returns a chart.point object with index as its x-coordinate and price as its y-coordinate.",
    requiredParams: ["index"],
    optionalParams: ["price"],
    signature: "chart.point.from_index(index, price) → chart.point",
    parameters: [
        {
          "name": "index",
          "type": "series int",
          "description": "The x-coordinate of the point, expressed as a bar index value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "price",
          "type": "series int/float",
          "description": "The y-coordinate of the point.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'chart.point.from_time': {
    name: 'chart.point.from_time',
    syntax: "chart.point.from_time(time, price) → chart.point",
    description: "Returns a chart.point object with time as its x-coordinate and price as its y-coordinate.",
    requiredParams: ["time"],
    optionalParams: ["price"],
    signature: "chart.point.from_time(time, price) → chart.point",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "The x-coordinate of the point, expressed as a UNIX time value, in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "price",
          "type": "series int/float",
          "description": "The y-coordinate of the point.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'chart.point.new': {
    name: 'chart.point.new',
    syntax: "chart.point.new(time, index, price) → chart.point",
    description: "Creates a new chart.point object with the specified time, index, and price.",
    requiredParams: ["time"],
    optionalParams: ["index","price"],
    signature: "chart.point.new(time, index, price) → chart.point",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "The x-coordinate of the point, expressed as a UNIX time value, in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "index",
          "type": "series int",
          "description": "The x-coordinate of the point, expressed as a bar index value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "price",
          "type": "series int/float",
          "description": "The y-coordinate of the point.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'chart.point.now': {
    name: 'chart.point.now',
    syntax: "chart.point.now(price) → chart.point",
    description: "Returns a chart.point object with price as the y-coordinate",
    requiredParams: [],
    optionalParams: ["price"],
    signature: "chart.point.now(price) → chart.point",
    parameters: [
        {
          "name": "price",
          "type": "series int/float",
          "description": "The y-coordinate of the point. Optional. The default is close.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'color': {
    name: 'color',
    syntax: "color(x) → const color",
    description: "Casts na to color",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "color(x) → const color",
    parameters: [
        {
          "name": "x",
          "type": "const color",
          "description": "The value to convert to the specified type, usually na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'color.b': {
    name: 'color.b',
    syntax: "color.b(color) → const float",
    description: "Retrieves the value of the color's blue component.",
    requiredParams: ["color"],
    optionalParams: [],
    signature: "color.b(color) → const float",
    parameters: [
        {
          "name": "color",
          "type": "const color",
          "description": "Color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'color.from_gradient': {
    name: 'color.from_gradient',
    syntax: "color.from_gradient(value, bottom_value, top_value, bottom_color, top_color) → series color",
    description: "Based on the relative position of value in the bottom_value to top_value range, the function returns a color from the gradient defined by bottom_color to top_color.",
    requiredParams: ["value"],
    optionalParams: ["bottom_value","top_value","bottom_color","top_color"],
    signature: "color.from_gradient(value, bottom_value, top_value, bottom_color, top_color) → series color",
    parameters: [
        {
          "name": "value",
          "type": "series int/float",
          "description": "Value to calculate the position-dependent color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "bottom_value",
          "type": "series int/float",
          "description": "Bottom position value corresponding to bottom_color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "top_value",
          "type": "series int/float",
          "description": "Top position value corresponding to top_color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "bottom_color",
          "type": "series color",
          "description": "Bottom position color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "top_color",
          "type": "series color",
          "description": "Top position color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'color.g': {
    name: 'color.g',
    syntax: "color.g(color) → const float",
    description: "Retrieves the value of the color's green component.",
    requiredParams: ["color"],
    optionalParams: [],
    signature: "color.g(color) → const float",
    parameters: [
        {
          "name": "color",
          "type": "const color",
          "description": "Color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'color.new': {
    name: 'color.new',
    syntax: "color.new(color, transp) → const color",
    description: "Function color applies the specified transparency to the given color.",
    requiredParams: ["color"],
    optionalParams: ["transp"],
    signature: "color.new(color, transp) → const color",
    parameters: [
        {
          "name": "color",
          "type": "const color",
          "description": "Color to apply transparency to.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "transp",
          "type": "const int/float",
          "description": "Possible values are from 0 (not transparent) to 100 (invisible).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'color.r': {
    name: 'color.r',
    syntax: "color.r(color) → const float",
    description: "Retrieves the value of the color's red component.",
    requiredParams: ["color"],
    optionalParams: [],
    signature: "color.r(color) → const float",
    parameters: [
        {
          "name": "color",
          "type": "const color",
          "description": "Color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'color.rgb': {
    name: 'color.rgb',
    syntax: "color.rgb(red, green, blue, transp) → const color",
    description: "Creates a new color with transparency using the RGB color model.",
    requiredParams: ["red"],
    optionalParams: ["green","blue","transp"],
    signature: "color.rgb(red, green, blue, transp) → const color",
    parameters: [
        {
          "name": "red",
          "type": "const int/float",
          "description": "Red color component. Possible values are from 0 to 255.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "green",
          "type": "const int/float",
          "description": "Green color component. Possible values are from 0 to 255.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "blue",
          "type": "const int/float",
          "description": "Blue color component. Possible values are from 0 to 255.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "transp",
          "type": "const int/float",
          "description": "Optional. Color transparency. Possible values are from 0 (opaque) to 100 (invisible). Default value is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'color.t': {
    name: 'color.t',
    syntax: "color.t(color) → const float",
    description: "Retrieves the color's transparency.",
    requiredParams: ["color"],
    optionalParams: [],
    signature: "color.t(color) → const float",
    parameters: [
        {
          "name": "color",
          "type": "const color",
          "description": "Color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'dayofmonth': {
    name: 'dayofmonth',
    syntax: "dayofmonth(time, timezone) → series int",
    description: "Calculates the day number of the month, in a specified time zone, from a UNIX timestamp.",
    requiredParams: ["time"],
    optionalParams: ["timezone"],
    signature: "dayofmonth(time, timezone) → series int",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "A UNIX timestamp in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "timezone",
          "type": "series string",
          "description": "Optional. Specifies the time zone of the returned day number. The value can be a time zone string in UTC/GMT offset notation (e.g., \"UTC-5\") or IANA time zone database notation (e.g., \"America/New_York\"). The default is syminfo.timezone.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'dayofweek': {
    name: 'dayofweek',
    syntax: "dayofweek(time, timezone) → series int",
    description: "Calculates the day number of the week, in a specified time zone, from a UNIX timestamp.",
    requiredParams: ["time"],
    optionalParams: ["timezone"],
    signature: "dayofweek(time, timezone) → series int",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "A UNIX timestamp in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "timezone",
          "type": "series string",
          "description": "Optional. Specifies the time zone of the returned day number. The value can be a time zone string in UTC/GMT offset notation (e.g., \"UTC-5\") or IANA time zone database notation (e.g., \"America/New_York\"). The default is syminfo.timezone.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'fill': {
    name: 'fill',
    syntax: "fill(hline1, hline2, color, title, editable, fillgaps, display) → void",
    description: "Fills background between two plots or hlines with a given color.",
    requiredParams: ["hline1","hline2"],
    optionalParams: ["color","title","editable","fillgaps","display"],
    signature: "fill(hline1, hline2, color, title, editable, fillgaps, display) → void",
    parameters: [
        {
          "name": "hline1",
          "type": "hline",
          "description": "The first hline object. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "hline2",
          "type": "hline",
          "description": "The second hline object. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "color",
          "type": "series color",
          "description": "Color of the background fill. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the created fill object. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "editable",
          "type": "input bool",
          "description": "If true then fill style will be editable in Format dialog. Default is true.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "fillgaps",
          "type": "const bool",
          "description": "Controls continuing fills on gaps, i.e., when one of the plot() calls returns an na value. When true, the last fill will continue on gaps. The default is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "input plot_simple_display",
          "description": "Controls where the fill is displayed. Possible values are: display.none, display.all. Default is display.all.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'fixnan': {
    name: 'fixnan',
    syntax: "fixnan(source) → series color",
    description: "For a given series replaces NaN values with previous nearest non-NaN value.",
    requiredParams: ["source"],
    optionalParams: [],
    signature: "fixnan(source) → series color",
    parameters: [
        {
          "name": "source",
          "type": "series color",
          "description": "Source used for the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'float': {
    name: 'float',
    syntax: "float(x) → const float",
    description: "Casts na to float",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "float(x) → const float",
    parameters: [
        {
          "name": "x",
          "type": "const int/float",
          "description": "The value to convert to the specified type, usually na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'hline': {
    name: 'hline',
    syntax: "hline(price, title, color, linestyle, linewidth, editable, display) → hline",
    description: "Renders a horizontal line at a given fixed price level.",
    requiredParams: ["price"],
    optionalParams: ["title","color","linestyle","linewidth","editable","display"],
    signature: "hline(price, title, color, linestyle, linewidth, editable, display) → hline",
    parameters: [
        {
          "name": "price",
          "type": "input int/float",
          "description": "Price value at which the object will be rendered. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "color",
          "type": "input color",
          "description": "Color of the rendered line. Must be a constant value (not an expression). Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "linestyle",
          "type": "input hline_style",
          "description": "Style of the rendered line. Possible values are: hline.style_solid, hline.style_dotted, hline.style_dashed. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "linewidth",
          "type": "input int",
          "description": "Width of the rendered line. Default value is 1.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "editable",
          "type": "input bool",
          "description": "If true then hline style will be editable in Format dialog. Default is true.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "input plot_simple_display",
          "description": "Controls where the hline is displayed. Possible values are: display.none, display.all. Default is display.all.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'hour': {
    name: 'hour',
    syntax: "hour(time, timezone) → series int",
    description: "time (series int) UNIX time in milliseconds.",
    requiredParams: ["time"],
    optionalParams: ["timezone"],
    signature: "hour(time, timezone) → series int",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "UNIX time in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "timezone",
          "type": "series string",
          "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'indicator': {
    name: 'indicator',
    syntax: "indicator(title, shorttitle, overlay, format, precision, scale, max_bars_back, timeframe, timeframe_gaps, explicit_plot_zorder, max_lines_count, max_labels_count, max_boxes_count, calc_bars_count, max_polylines_count, dynamic_requests, behind_chart) → void",
    description: "This declaration statement designates the script as an indicator and sets a number of indicator-related properties.",
    requiredParams: ["title","max_bars_back"],
    optionalParams: ["shorttitle","overlay","format","precision","scale","timeframe","timeframe_gaps","explicit_plot_zorder","max_lines_count","max_labels_count","max_boxes_count","calc_bars_count","max_polylines_count","dynamic_requests","behind_chart"],
    signature: "indicator(title, shorttitle, overlay, format, precision, scale, max_bars_back, timeframe, timeframe_gaps, explicit_plot_zorder, max_lines_count, max_labels_count, max_boxes_count, calc_bars_count, max_polylines_count, dynamic_requests, behind_chart) → void",
    parameters: [
        {
          "name": "title",
          "type": "const string",
          "description": "The title of the script. It is displayed on the chart when no shorttitle argument is used, and becomes the publication's default title when publishing the script.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "shorttitle",
          "type": "const string",
          "description": "The script's display name on charts. If specified, it will replace the title argument in most chart-related windows. Optional. The default is the argument used for title.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "overlay",
          "type": "const bool",
          "description": "If true, the script's visuals appear on the main chart pane if the user adds it to the chart directly, or in another script's pane if the user applies it to that script. If false, the script's visuals appear in a separate pane. Changes to the overlay value apply only after the user adds the script to the chart again. Additionally, if the user moves the script to another pane by selecting a \"Move to\" option in the script's \"More\" menu, it does not move back to its original pane after any updates to the source code. The default is false.  Strategy-specific labels that display entries and exits will be displayed over the main chart regardless of this setting.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "format",
          "type": "const string",
          "description": "Specifies the formatting of the script's displayed values. Possible values: format.inherit, format.price, format.volume, format.percent. Optional. The default is format.inherit.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "precision",
          "type": "const int",
          "description": "Specifies the number of digits after the floating point of the script's displayed values. Must be a non-negative integer no greater than 16. If format is set to format.inherit and precision is specified, the format will instead be set to format.price. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is inherited from the precision of the chart's symbol.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "scale",
          "type": "const scale_type",
          "description": "The price scale used. Possible values: scale.right, scale.left, scale.none. The scale.none value can only be applied in combination with overlay = true. Optional. By default, the script uses the same scale as the chart.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "max_bars_back",
          "type": "const int",
          "description": "The length of the historical buffer the script keeps for every variable and function, which determines how many past values can be referenced using the [] history-referencing operator. The required buffer size is automatically detected by the Pine Script® runtime. Using this parameter is only necessary when a runtime error occurs because automatic detection fails. More information on the underlying mechanics of the historical buffer can be found in our Help Center. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "timeframe",
          "type": "const string",
          "description": "Adds multi-timeframe functionality to simple scripts. When specified, a \"Timeframe\" field will be included in the \"Calculation\" section of the script's \"Settings/Inputs\" tab. The field's default value will be the argument supplied, whose format must conform to timeframe string specifications. To specify the chart's timeframe, use an empty string or the timeframe.period variable. The parameter cannot be used with scripts using Pine Script® drawings. Optional. The default is timeframe.period.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "timeframe_gaps",
          "type": "const bool",
          "description": "Specifies how the indicator's values are displayed on chart bars when the timeframe is higher than the chart's. If true, a value only appears on a chart bar when the higher timeframe value becomes available, otherwise na is returned (thus a \"gap\" occurs). With false, what would otherwise be gaps are filled with the latest known value returned, avoiding na values. When specified, a \"Wait for timeframe closes\" checkbox will be included in the \"Calculation\" section of the script's \"Settings/Inputs\" tab. Optional. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "explicit_plot_zorder",
          "type": "const bool",
          "description": "Specifies the order in which the script's plots, fills, and hlines are rendered. If true, plots are drawn in the order in which they appear in the script's code, each newer plot being drawn above the previous ones. This only applies to plot*() functions, fill, and hline. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "max_lines_count",
          "type": "const int",
          "description": "The number of last line drawings displayed. Possible values: 1-500. The count is approximate; more drawings than the specified count may be displayed. Optional. The default is 50.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "max_labels_count",
          "type": "const int",
          "description": "The number of last label drawings displayed. Possible values: 1-500. The count is approximate; more drawings than the specified count may be displayed. Optional. The default is 50.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "max_boxes_count",
          "type": "const int",
          "description": "The number of last box drawings displayed. Possible values: 1-500. The count is approximate; more drawings than the specified count may be displayed. Optional. The default is 50.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "calc_bars_count",
          "type": "const int",
          "description": "Limits the initial calculation of a script to the last number of bars specified. When specified, a \"Calculated bars\" field will be included in the \"Calculation\" section of the script's \"Settings/Inputs\" tab. Optional. The default is 0, in which case the script executes on all available bars.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "max_polylines_count",
          "type": "const int",
          "description": "The number of last polyline drawings displayed. Possible values: 1-100. The count is approximate; more drawings than the specified count may be displayed. Optional. The default is 50.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "dynamic_requests",
          "type": "const bool",
          "description": "Specifies whether the script can dynamically call functions from the request.*() namespace. Dynamic request.*() calls are allowed within the local scopes of conditional structures (e.g., if), loops (e.g., for), and exported functions. Additionally, such calls allow \"series\" arguments for many of their parameters. Optional. The default is true. See the User Manual's Dynamic requests section for more information.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "behind_chart",
          "type": "const bool",
          "description": "Optional. Controls whether all plots and drawings appear behind the chart display (if true) or in front of it (if false). This parameter only takes effect when the overlay parameter is true. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input': {
    name: 'input',
    syntax: "input(defval, title, tooltip, inline, group, display, active) → input color",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function automatically detects the type of the argument used for 'defval' and uses the corresponding input widget.",
    requiredParams: ["defval"],
    optionalParams: ["title","tooltip","inline","group","display","active"],
    signature: "input(defval, title, tooltip, inline, group, display, active) → input color",
    parameters: [
        {
          "name": "defval",
          "type": "const int/float/bool/string/color or source-type built-ins",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where script users can change it. Source-type built-ins are built-in series float variables that specify the source of the calculation: close, hlc3, etc.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default depends on the type of the value passed to defval: display.none for bool and color values, display.all for everything else.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.bool': {
    name: 'input.bool',
    syntax: "input.bool(defval, title, tooltip, inline, group, confirm, display, active) → input bool",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a checkmark to the script's inputs.",
    requiredParams: ["defval"],
    optionalParams: ["title","tooltip","inline","group","confirm","display","active"],
    signature: "input.bool(defval, title, tooltip, inline, group, confirm, display, active) → input bool",
    parameters: [
        {
          "name": "defval",
          "type": "const bool",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.color': {
    name: 'input.color',
    syntax: "input.color(defval, title, tooltip, inline, group, confirm, display, active) → input color",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a color picker that allows the user to select a color and transparency, either from a palette or a hex value.",
    requiredParams: ["defval"],
    optionalParams: ["title","tooltip","inline","group","confirm","display","active"],
    signature: "input.color(defval, title, tooltip, inline, group, confirm, display, active) → input color",
    parameters: [
        {
          "name": "defval",
          "type": "const color",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.enum': {
    name: 'input.enum',
    syntax: "input.enum(defval, title, options, tooltip, inline, group, confirm, display, active) → input enum",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a dropdown with options based on the enum fields passed to its defval and options parameters.",
    requiredParams: ["defval"],
    optionalParams: ["title","options","tooltip","inline","group","confirm","display","active"],
    signature: "input.enum(defval, title, options, tooltip, inline, group, confirm, display, active) → input enum",
    parameters: [
        {
          "name": "defval",
          "type": "const enum",
          "description": "Determines the default value of the input, which users can change in the script's \"Settings/Inputs\" tab. When the options parameter has a specified tuple of enum fields, the tuple must include the defval.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "options",
          "type": "tuple of enum fields: [enumName.field1, enumName.field2, ...]",
          "description": "A list of options to choose from. Optional. By default, the titles of all of the enum's fields are available in the dropdown. Passing a tuple as the options argument limits the list to only the included fields.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.float': {
    name: 'input.float',
    syntax: "input.float(defval, title, options, tooltip, inline, group, confirm, display, active) → input float",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a field for a float input to the script's inputs.",
    requiredParams: ["defval"],
    optionalParams: ["title","options","tooltip","inline","group","confirm","display","active"],
    signature: "input.float(defval, title, options, tooltip, inline, group, confirm, display, active) → input float",
    parameters: [
        {
          "name": "defval",
          "type": "const int/float",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where script users can change it. When a list of values is used with the options parameter, the value must be one of them.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "options",
          "type": "tuple of const int/float values: [val1, val2, ...]",
          "description": "A list of options to choose from a dropdown menu, separated by commas and enclosed in square brackets: [val1, val2, ...]. When using this parameter, the minval, maxval and step parameters cannot be used.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.int': {
    name: 'input.int',
    syntax: "input.int(defval, title, options, tooltip, inline, group, confirm, display, active) → input int",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a field for an integer input to the script's inputs.",
    requiredParams: ["defval"],
    optionalParams: ["title","options","tooltip","inline","group","confirm","display","active"],
    signature: "input.int(defval, title, options, tooltip, inline, group, confirm, display, active) → input int",
    parameters: [
        {
          "name": "defval",
          "type": "const int",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where script users can change it. When a list of values is used with the options parameter, the value must be one of them.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "options",
          "type": "tuple of const int values: [val1, val2, ...]",
          "description": "A list of options to choose from a dropdown menu, separated by commas and enclosed in square brackets: [val1, val2, ...]. When using this parameter, the minval, maxval and step parameters cannot be used.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.price': {
    name: 'input.price',
    syntax: "input.price(defval, title, tooltip, inline, group, confirm, display, active) → input float",
    description: "Adds a price input to the script's \"Settings/Inputs\" tab. The user can change the price in the settings or by selecting the indicator and dragging the price line.",
    requiredParams: ["defval"],
    optionalParams: ["title","tooltip","inline","group","confirm","display","active"],
    signature: "input.price(defval, title, tooltip, inline, group, confirm, display, active) → input float",
    parameters: [
        {
          "name": "defval",
          "type": "const int/float",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "Optional. If true, the script prompts the user to set the input's initial value by clicking a point on the chart. If inputs of other types require confirmation, the \"Confirm inputs\" dialog box also displays this input's field, allowing final adjustments to the value before the script starts to run. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.session': {
    name: 'input.session',
    syntax: "input.session(defval, title, options, tooltip, inline, group, confirm, display, active) → input string",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds two dropdowns that allow the user to specify the beginning and the end of a session using the session selector and returns the result as a string.",
    requiredParams: ["defval"],
    optionalParams: ["title","options","tooltip","inline","group","confirm","display","active"],
    signature: "input.session(defval, title, options, tooltip, inline, group, confirm, display, active) → input string",
    parameters: [
        {
          "name": "defval",
          "type": "const string",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it. When a list of values is used with the options parameter, the value must be one of them.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "options",
          "type": "tuple of const string values: [val1, val2, ...]",
          "description": "A list of options to choose from.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.source': {
    name: 'input.source',
    syntax: "input.source(defval, title, tooltip, inline, group, display, active, confirm) → series float",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a dropdown that allows the user to select a source for the calculation, e.g. close, hl2, etc. The user can also select an output from another indicator on their chart as the source.",
    requiredParams: ["defval"],
    optionalParams: ["title","tooltip","inline","group","display","active","confirm"],
    signature: "input.source(defval, title, tooltip, inline, group, display, active, confirm) → series float",
    parameters: [
        {
          "name": "defval",
          "type": "open/high/low/close/hl2/hlc3/ohlc4/hlcc4",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'input.string': {
    name: 'input.string',
    syntax: "input.string(defval, title, options, tooltip, inline, group, confirm, display, active) → input string",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a field for a string input to the script's inputs.",
    requiredParams: ["defval"],
    optionalParams: ["title","options","tooltip","inline","group","confirm","display","active"],
    signature: "input.string(defval, title, options, tooltip, inline, group, confirm, display, active) → input string",
    parameters: [
        {
          "name": "defval",
          "type": "const string",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it. When a list of values is used with the options parameter, the value must be one of them.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "options",
          "type": "tuple of const string values: [val1, val2, ...]",
          "description": "A list of options to choose from.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.symbol': {
    name: 'input.symbol',
    syntax: "input.symbol(defval, title, tooltip, inline, group, confirm, display, active) → input string",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a field that allows the user to select a specific symbol using the symbol search and returns that symbol, paired with its exchange prefix, as a string.",
    requiredParams: ["defval"],
    optionalParams: ["title","tooltip","inline","group","confirm","display","active"],
    signature: "input.symbol(defval, title, tooltip, inline, group, confirm, display, active) → input string",
    parameters: [
        {
          "name": "defval",
          "type": "const string",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.text_area': {
    name: 'input.text_area',
    syntax: "input.text_area(defval, title, tooltip, group, confirm, display, active) → input string",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a field for a multiline text input.",
    requiredParams: ["defval"],
    optionalParams: ["title","tooltip","group","confirm","display","active"],
    signature: "input.text_area(defval, title, tooltip, group, confirm, display, active) → input string",
    parameters: [
        {
          "name": "defval",
          "type": "const string",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.time': {
    name: 'input.time',
    syntax: "input.time(defval, title, tooltip, inline, group, confirm, display, active) → input int",
    description: "Adds two inputs to the script's \"Settings/Inputs\" tab on the same line: one for the date and one for the time. The user can change the price in the settings or by selecting the indicator and dragging the price line. The function returns a date/time value in UNIX format.",
    requiredParams: ["defval"],
    optionalParams: ["title","tooltip","inline","group","confirm","display","active"],
    signature: "input.time(defval, title, tooltip, inline, group, confirm, display, active) → input int",
    parameters: [
        {
          "name": "defval",
          "type": "const int",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it. The value can be a timestamp function, but only if it uses a date argument in const string format.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "Optional. If true, the script prompts the user to set the input's initial value by clicking a point on the chart. If inputs of other types require confirmation, the \"Confirm inputs\" dialog box also displays this input's field, allowing final adjustments to the value before the script starts to run. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'input.timeframe': {
    name: 'input.timeframe',
    syntax: "input.timeframe(defval, title, options, tooltip, inline, group, confirm, display, active) → input string",
    description: "Adds an input to the Inputs tab of your script's Settings, which allows you to provide configuration options to script users. This function adds a dropdown that allows the user to select a specific timeframe via the timeframe selector and returns it as a string. The selector includes the custom timeframes a user may have added using the chart's Timeframe dropdown.",
    requiredParams: ["defval"],
    optionalParams: ["title","options","tooltip","inline","group","confirm","display","active"],
    signature: "input.timeframe(defval, title, options, tooltip, inline, group, confirm, display, active) → input string",
    parameters: [
        {
          "name": "defval",
          "type": "const string",
          "description": "Determines the default value of the input variable proposed in the script's \"Settings/Inputs\" tab, from where the user can change it. When a list of values is used with the options parameter, the value must be one of them.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the input. If not specified, the variable name is used as the input's title. If the title is specified, but it is empty, the name will be an empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "options",
          "type": "tuple of const string values: [val1, val2, ...]",
          "description": "A list of options to choose from.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "const string",
          "description": "The string that will be shown to the user when hovering over the tooltip icon.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "inline",
          "type": "const string",
          "description": "Combines all the input calls using the same argument in one line. The string used as an argument is not displayed. It is only used to identify inputs belonging to the same line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "group",
          "type": "const string",
          "description": "Creates a header above all inputs using the same group argument string. The string is also used as the header's text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "confirm",
          "type": "const bool",
          "description": "If true, then user will be asked to confirm input value before indicator is added to chart. Default value is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "display",
          "type": "const plot_display",
          "description": "Controls where the script will display the input's information, aside from within the script's settings. This option allows one to remove a specific input from the script's status line or the Data Window to ensure only the most necessary inputs are displayed there. Possible values: display.none, display.data_window, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "active",
          "type": "input bool",
          "description": "Optional. Specifies whether users can change the value of the input in the script's \"Settings/Inputs\" tab. The script can use this parameter to set the state of the input based on the values of other inputs. If true, users can change the value of the input. If false, the input is grayed out, and users cannot change the value. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'int': {
    name: 'int',
    syntax: "int(x) → const int",
    description: "Casts na or truncates float value to int",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "int(x) → const int",
    parameters: [
        {
          "name": "x",
          "type": "const int/float",
          "description": "The value to convert to the specified type, usually na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'label': {
    name: 'label',
    syntax: "label(x) → series label",
    description: "Casts na to label",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "label(x) → series label",
    parameters: [
        {
          "name": "x",
          "type": "series label",
          "description": "The value to convert to the specified type, usually na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'label.copy': {
    name: 'label.copy',
    syntax: "label.copy(id) → series label",
    description: "Clones the label object.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "label.copy(id) → series label",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'label.delete': {
    name: 'label.delete',
    syntax: "label.delete(id) → void",
    description: "Deletes the specified label object. If it has already been deleted, does nothing.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "label.delete(id) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object to delete.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'label.get_text': {
    name: 'label.get_text',
    syntax: "label.get_text(id) → series string",
    description: "Returns the text of this label object.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "label.get_text(id) → series string",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'label.get_x': {
    name: 'label.get_x',
    syntax: "label.get_x(id) → series int",
    description: "Returns UNIX time or bar index (depending on the last xloc value set) of this label's position.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "label.get_x(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'label.get_y': {
    name: 'label.get_y',
    syntax: "label.get_y(id) → series float",
    description: "Returns price of this label's position.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "label.get_y(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'label.new': {
    name: 'label.new',
    syntax: "label.new(point, text, xloc, yloc, color, style, textcolor, size, textalign, tooltip, text_font_family, force_overlay, text_formatting) → series label",
    description: "Creates new label object.",
    requiredParams: ["point"],
    optionalParams: ["text","xloc","yloc","color","style","textcolor","size","textalign","tooltip","text_font_family","force_overlay","text_formatting"],
    signature: "label.new(point, text, xloc, yloc, color, style, textcolor, size, textalign, tooltip, text_font_family, force_overlay, text_formatting) → series label",
    parameters: [
        {
          "name": "point",
          "type": "chart.point",
          "description": "A chart.point object that specifies the label's location.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text",
          "type": "series string",
          "description": "Label text. Default is empty string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "xloc",
          "type": "series string",
          "description": "See description of x argument. Possible values: xloc.bar_index and xloc.bar_time. Default is xloc.bar_index.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "yloc",
          "type": "series string",
          "description": "Possible values are yloc.price, yloc.abovebar, yloc.belowbar. If yloc=yloc.price, y argument specifies the price of the label position. If yloc=yloc.abovebar, label is located above bar. If yloc=yloc.belowbar, label is located below bar. Default is yloc.price.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "color",
          "type": "series color",
          "description": "Color of the label border and arrow",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "style",
          "type": "series string",
          "description": "Label style. Possible values: label.style_none, label.style_xcross, label.style_cross, label.style_triangleup, label.style_triangledown, label.style_flag, label.style_circle, label.style_arrowup, label.style_arrowdown, label.style_label_up, label.style_label_down, label.style_label_left, label.style_label_right, label.style_label_lower_left, label.style_label_lower_right, label.style_label_upper_left, label.style_label_upper_right, label.style_label_center, label.style_square, label.style_diamond, label.style_text_outline. Default is label.style_label_down.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "textcolor",
          "type": "series color",
          "description": "Text color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "size",
          "type": "series int/string",
          "description": "Optional. Size of the label. Accepts a positive int value or one of the built-in size.* constants. The constants and their equivalent numeric sizes are: size.auto (0), size.tiny (~7), size.small (~10), size.normal (12), size.large (18), size.huge (24). The default value is size.normal, which represents the numeric size of 12.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "textalign",
          "type": "series string",
          "description": "Label text alignment. Possible values: text.align_left, text.align_center, text.align_right. Default value is text.align_center.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "series string",
          "description": "Hover to see tooltip label.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text_font_family",
          "type": "series string",
          "description": "The font family of the text. Optional. The default value is font.family_default. Possible values: font.family_default, font.family_monospace.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the drawing will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_formatting",
          "type": "const text_format",
          "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'label.set_color': {
    name: 'label.set_color',
    syntax: "label.set_color(id, color) → void",
    description: "Sets label border and arrow color.",
    requiredParams: ["id"],
    optionalParams: ["color"],
    signature: "label.set_color(id, color) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "color",
          "type": "series color",
          "description": "New label border and arrow color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_point': {
    name: 'label.set_point',
    syntax: "label.set_point(id, point) → void",
    description: "Sets the location of the id label to point.",
    requiredParams: ["id"],
    optionalParams: ["point"],
    signature: "label.set_point(id, point) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "A label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "point",
          "type": "chart.point",
          "description": "A chart.point object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_size': {
    name: 'label.set_size',
    syntax: "label.set_size(id, size) → void",
    description: "Sets arrow and text size of the specified label object.",
    requiredParams: ["id"],
    optionalParams: ["size"],
    signature: "label.set_size(id, size) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "size",
          "type": "series int/string",
          "description": "Size of the label. Accepts a positive int value or one of the built-in size.* constants. The constants and their equivalent numeric sizes are: size.auto (0), size.tiny (~7), size.small (~10), size.normal (12), size.large (18), size.huge (24). The default value is size.normal, which represents the numeric size of 12.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_style': {
    name: 'label.set_style',
    syntax: "label.set_style(id, style) → void",
    description: "Sets label style.",
    requiredParams: ["id"],
    optionalParams: ["style"],
    signature: "label.set_style(id, style) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "style",
          "type": "series string",
          "description": "New label style. Possible values: label.style_none, label.style_xcross, label.style_cross, label.style_triangleup, label.style_triangledown, label.style_flag, label.style_circle, label.style_arrowup, label.style_arrowdown, label.style_label_up, label.style_label_down, label.style_label_left, label.style_label_right, label.style_label_lower_left, label.style_label_lower_right, label.style_label_upper_left, label.style_label_upper_right, label.style_label_center, label.style_square, label.style_diamond, label.style_text_outline.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_text': {
    name: 'label.set_text',
    syntax: "label.set_text(id, text) → void",
    description: "Sets label text",
    requiredParams: ["id"],
    optionalParams: ["text"],
    signature: "label.set_text(id, text) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text",
          "type": "series string",
          "description": "New label text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_text_font_family': {
    name: 'label.set_text_font_family',
    syntax: "label.set_text_font_family(id, text_font_family) → void",
    description: "The function sets the font family of the text inside the label.",
    requiredParams: ["id"],
    optionalParams: ["text_font_family"],
    signature: "label.set_text_font_family(id, text_font_family) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "A label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text_font_family",
          "type": "series string",
          "description": "The font family of the text. Possible values: font.family_default, font.family_monospace.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_text_formatting': {
    name: 'label.set_text_formatting',
    syntax: "label.set_text_formatting(id, text_formatting) → void",
    description: "Sets the formatting attributes the drawing applies to displayed text.",
    requiredParams: ["id"],
    optionalParams: ["text_formatting"],
    signature: "label.set_text_formatting(id, text_formatting) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "text_formatting",
          "type": "const text_format",
          "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'label.set_textalign': {
    name: 'label.set_textalign',
    syntax: "label.set_textalign(id, textalign) → void",
    description: "Sets the alignment for the label text.",
    requiredParams: ["id"],
    optionalParams: ["textalign"],
    signature: "label.set_textalign(id, textalign) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "textalign",
          "type": "series string",
          "description": "Label text alignment. Possible values: text.align_left, text.align_center, text.align_right.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_textcolor': {
    name: 'label.set_textcolor',
    syntax: "label.set_textcolor(id, textcolor) → void",
    description: "Sets color of the label text.",
    requiredParams: ["id"],
    optionalParams: ["textcolor"],
    signature: "label.set_textcolor(id, textcolor) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "textcolor",
          "type": "series color",
          "description": "New text color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_tooltip': {
    name: 'label.set_tooltip',
    syntax: "label.set_tooltip(id, tooltip) → void",
    description: "Sets the tooltip text.",
    requiredParams: ["id"],
    optionalParams: ["tooltip"],
    signature: "label.set_tooltip(id, tooltip) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "tooltip",
          "type": "series string",
          "description": "Tooltip text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_x': {
    name: 'label.set_x',
    syntax: "label.set_x(id, x) → void",
    description: "Sets bar index or bar time (depending on the xloc) of the label position.",
    requiredParams: ["id"],
    optionalParams: ["x"],
    signature: "label.set_x(id, x) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "x",
          "type": "series int",
          "description": "New bar index or bar time of the label position. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_xloc': {
    name: 'label.set_xloc',
    syntax: "label.set_xloc(id, x, xloc) → void",
    description: "Sets x-location and new bar index/time value.",
    requiredParams: ["id"],
    optionalParams: ["x","xloc"],
    signature: "label.set_xloc(id, x, xloc) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "x",
          "type": "series int",
          "description": "New bar index or bar time of the label position.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "xloc",
          "type": "series string",
          "description": "New x-location value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_xy': {
    name: 'label.set_xy',
    syntax: "label.set_xy(id, x, y) → void",
    description: "Sets bar index/time and price of the label position.",
    requiredParams: ["id"],
    optionalParams: ["x","y"],
    signature: "label.set_xy(id, x, y) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "x",
          "type": "series int",
          "description": "New bar index or bar time of the label position. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "y",
          "type": "series int/float",
          "description": "New price of the label position.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_y': {
    name: 'label.set_y',
    syntax: "label.set_y(id, y) → void",
    description: "Sets price of the label position",
    requiredParams: ["id"],
    optionalParams: ["y"],
    signature: "label.set_y(id, y) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "y",
          "type": "series int/float",
          "description": "New price of the label position.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'label.set_yloc': {
    name: 'label.set_yloc',
    syntax: "label.set_yloc(id, yloc) → void",
    description: "Sets new y-location calculation algorithm.",
    requiredParams: ["id"],
    optionalParams: ["yloc"],
    signature: "label.set_yloc(id, yloc) → void",
    parameters: [
        {
          "name": "id",
          "type": "series label",
          "description": "Label object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "yloc",
          "type": "series string",
          "description": "New y-location value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'library': {
    name: 'library',
    syntax: "library(title, overlay, dynamic_requests) → void",
    description: "Declaration statement identifying a script as a library.",
    requiredParams: ["title"],
    optionalParams: ["overlay","dynamic_requests"],
    signature: "library(title, overlay, dynamic_requests) → void",
    parameters: [
        {
          "name": "title",
          "type": "const string",
          "description": "The title of the library and its identifier. It cannot contain spaces, special characters or begin with a digit. It is used as the publication's default title, and to uniquely identify the library in the import statement, when another script uses it. It is also used as the script's name on the chart.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "overlay",
          "type": "const bool",
          "description": "If true, the script's visuals appear on the main chart pane if the user adds it to the chart directly, or in another script's pane if the user applies it to that script. If false, the script's visuals appear in a separate pane. Changes to the overlay value apply only after the user adds the script to the chart again. Additionally, if the user moves the script to another pane by selecting a \"Move to\" option in the script's \"More\" menu, it does not move back to its original pane after any updates to the source code. The default is false.  Strategy-specific labels that display entries and exits will be displayed over the main chart regardless of this setting.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "dynamic_requests",
          "type": "const bool",
          "description": "Specifies whether the script can dynamically call functions from the request.*() namespace. Dynamic request.*() calls are allowed within the local scopes of conditional structures (e.g., if), loops (e.g., for), and exported functions. Additionally, such calls allow \"series\" arguments for many of their parameters. Optional. The default is true. See the User Manual's Dynamic requests section for more information.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'line': {
    name: 'line',
    syntax: "line(x) → series line",
    description: "Casts na to line",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "line(x) → series line",
    parameters: [
        {
          "name": "x",
          "type": "series line",
          "description": "The value to convert to the specified type, usually na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'line.copy': {
    name: 'line.copy',
    syntax: "line.copy(id) → series line",
    description: "Clones the line object.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "line.copy(id) → series line",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'line.delete': {
    name: 'line.delete',
    syntax: "line.delete(id) → void",
    description: "Deletes the specified line object. If it has already been deleted, does nothing.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "line.delete(id) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object to delete.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'line.get_price': {
    name: 'line.get_price',
    syntax: "line.get_price(id, x) → series float",
    description: "Returns the price level of a line at a given bar index.",
    requiredParams: ["id","x"],
    optionalParams: [],
    signature: "line.get_price(id, x) → series float",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "x",
          "type": "series int",
          "description": "Bar index for which price is required.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        }
      ]
  },
  'line.get_x1': {
    name: 'line.get_x1',
    syntax: "line.get_x1(id) → series int",
    description: "Returns UNIX time or bar index (depending on the last xloc value set) of the first point of the line.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "line.get_x1(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'line.get_x2': {
    name: 'line.get_x2',
    syntax: "line.get_x2(id) → series int",
    description: "Returns UNIX time or bar index (depending on the last xloc value set) of the second point of the line.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "line.get_x2(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'line.get_y1': {
    name: 'line.get_y1',
    syntax: "line.get_y1(id) → series float",
    description: "Returns price of the first point of the line.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "line.get_y1(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'line.get_y2': {
    name: 'line.get_y2',
    syntax: "line.get_y2(id) → series float",
    description: "Returns price of the second point of the line.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "line.get_y2(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'line.new': {
    name: 'line.new',
    syntax: "line.new(first_point, second_point, xloc, extend, color, style, width, force_overlay) → series line",
    description: "Creates new line object.",
    requiredParams: ["first_point"],
    optionalParams: ["second_point","xloc","extend","color","style","width","force_overlay"],
    signature: "line.new(first_point, second_point, xloc, extend, color, style, width, force_overlay) → series line",
    parameters: [
        {
          "name": "first_point",
          "type": "chart.point",
          "description": "A chart.point object that specifies the line's starting coordinate.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "second_point",
          "type": "chart.point",
          "description": "A chart.point object that specifies the line's ending coordinate.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "xloc",
          "type": "series string",
          "description": "See description of x1 argument. Possible values: xloc.bar_index and xloc.bar_time. Default is xloc.bar_index.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "extend",
          "type": "series string",
          "description": "If extend=extend.none, draws segment starting at point (x1, y1) and ending at point (x2, y2). If extend is equal to extend.right or extend.left, draws a ray starting at point (x1, y1) or (x2, y2), respectively. If extend=extend.both, draws a straight line that goes through these points. Default value is extend.none.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "color",
          "type": "series color",
          "description": "Line color.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "style",
          "type": "series string",
          "description": "Line style. Possible values: line.style_solid, line.style_dotted, line.style_dashed, line.style_arrow_left, line.style_arrow_right, line.style_arrow_both.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "width",
          "type": "series int",
          "description": "Line width in pixels.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the drawing will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'line.set_color': {
    name: 'line.set_color',
    syntax: "line.set_color(id, color) → void",
    description: "Sets the line color",
    requiredParams: ["id"],
    optionalParams: ["color"],
    signature: "line.set_color(id, color) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "color",
          "type": "series color",
          "description": "New line color",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_extend': {
    name: 'line.set_extend',
    syntax: "line.set_extend(id, extend) → void",
    description: "Sets extending type of this line object. If extend=extend.none, draws segment starting at point (x1, y1) and ending at point (x2, y2). If extend is equal to extend.right or extend.left, draws a ray starting at point (x1, y1) or (x2, y2), respectively. If extend=extend.both, draws a straight line that goes through these points.",
    requiredParams: ["id"],
    optionalParams: ["extend"],
    signature: "line.set_extend(id, extend) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "extend",
          "type": "series string",
          "description": "New extending type.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_first_point': {
    name: 'line.set_first_point',
    syntax: "line.set_first_point(id, point) → void",
    description: "Sets the first point of the id line to point.",
    requiredParams: ["id"],
    optionalParams: ["point"],
    signature: "line.set_first_point(id, point) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "A line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "point",
          "type": "chart.point",
          "description": "A chart.point object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_second_point': {
    name: 'line.set_second_point',
    syntax: "line.set_second_point(id, point) → void",
    description: "Sets the second point of the id line to point.",
    requiredParams: ["id"],
    optionalParams: ["point"],
    signature: "line.set_second_point(id, point) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "A line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "point",
          "type": "chart.point",
          "description": "A chart.point object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_style': {
    name: 'line.set_style',
    syntax: "line.set_style(id, style) → void",
    description: "Sets the line style",
    requiredParams: ["id"],
    optionalParams: ["style"],
    signature: "line.set_style(id, style) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "style",
          "type": "series string",
          "description": "New line style.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_width': {
    name: 'line.set_width',
    syntax: "line.set_width(id, width) → void",
    description: "Sets the line width.",
    requiredParams: ["id"],
    optionalParams: ["width"],
    signature: "line.set_width(id, width) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "width",
          "type": "series int",
          "description": "New line width in pixels.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_x1': {
    name: 'line.set_x1',
    syntax: "line.set_x1(id, x) → void",
    description: "Sets bar index or bar time (depending on the xloc) of the first point.",
    requiredParams: ["id"],
    optionalParams: ["x"],
    signature: "line.set_x1(id, x) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "x",
          "type": "series int",
          "description": "Bar index or bar time. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_x2': {
    name: 'line.set_x2',
    syntax: "line.set_x2(id, x) → void",
    description: "Sets bar index or bar time (depending on the xloc) of the second point.",
    requiredParams: ["id"],
    optionalParams: ["x"],
    signature: "line.set_x2(id, x) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "x",
          "type": "series int",
          "description": "Bar index or bar time. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_xloc': {
    name: 'line.set_xloc',
    syntax: "line.set_xloc(id, x1, x2, xloc) → void",
    description: "Sets x-location and new bar index/time values.",
    requiredParams: ["id"],
    optionalParams: ["x1","x2","xloc"],
    signature: "line.set_xloc(id, x1, x2, xloc) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "x1",
          "type": "series int",
          "description": "Bar index or bar time of the first point.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "x2",
          "type": "series int",
          "description": "Bar index or bar time of the second point.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "xloc",
          "type": "series string",
          "description": "New x-location value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_xy1': {
    name: 'line.set_xy1',
    syntax: "line.set_xy1(id, x, y) → void",
    description: "Sets bar index/time and price of the first point.",
    requiredParams: ["id"],
    optionalParams: ["x","y"],
    signature: "line.set_xy1(id, x, y) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "x",
          "type": "series int",
          "description": "Bar index or bar time. Note that objects positioned using xloc.bar_index cannot be drawn further than 500 bars into the future.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "y",
          "type": "series int/float",
          "description": "Price.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_xy2': {
    name: 'line.set_xy2',
    syntax: "line.set_xy2(id, x, y) → void",
    description: "Sets bar index/time and price of the second point",
    requiredParams: ["id"],
    optionalParams: ["x","y"],
    signature: "line.set_xy2(id, x, y) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "x",
          "type": "series int",
          "description": "Bar index or bar time.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "y",
          "type": "series int/float",
          "description": "Price.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_y1': {
    name: 'line.set_y1',
    syntax: "line.set_y1(id, y) → void",
    description: "Sets price of the first point",
    requiredParams: ["id"],
    optionalParams: ["y"],
    signature: "line.set_y1(id, y) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "y",
          "type": "series int/float",
          "description": "Price.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'line.set_y2': {
    name: 'line.set_y2',
    syntax: "line.set_y2(id, y) → void",
    description: "Sets price of the second point.",
    requiredParams: ["id"],
    optionalParams: ["y"],
    signature: "line.set_y2(id, y) → void",
    parameters: [
        {
          "name": "id",
          "type": "series line",
          "description": "Line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "y",
          "type": "series int/float",
          "description": "Price.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'linefill': {
    name: 'linefill',
    syntax: "linefill(x) → series linefill",
    description: "Casts na to linefill.",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "linefill(x) → series linefill",
    parameters: [
        {
          "name": "x",
          "type": "series linefill",
          "description": "The value to convert to the specified type, usually na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'linefill.delete': {
    name: 'linefill.delete',
    syntax: "linefill.delete(id) → void",
    description: "Deletes the specified linefill object. If it has already been deleted, does nothing.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "linefill.delete(id) → void",
    parameters: [
        {
          "name": "id",
          "type": "series linefill",
          "description": "A linefill object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'linefill.get_line1': {
    name: 'linefill.get_line1',
    syntax: "linefill.get_line1(id) → series line",
    description: "Returns the ID of the first line used in the id linefill.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "linefill.get_line1(id) → series line",
    parameters: [
        {
          "name": "id",
          "type": "series linefill",
          "description": "A linefill object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'linefill.get_line2': {
    name: 'linefill.get_line2',
    syntax: "linefill.get_line2(id) → series line",
    description: "Returns the ID of the second line used in the id linefill.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "linefill.get_line2(id) → series line",
    parameters: [
        {
          "name": "id",
          "type": "series linefill",
          "description": "A linefill object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'linefill.new': {
    name: 'linefill.new',
    syntax: "linefill.new(line1, line2, color) → series linefill",
    description: "Creates a new linefill object and displays it on the chart, filling the space between line1 and line2 with the color specified in color.",
    requiredParams: ["line1"],
    optionalParams: ["line2","color"],
    signature: "linefill.new(line1, line2, color) → series linefill",
    parameters: [
        {
          "name": "line1",
          "type": "series line",
          "description": "First line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "line2",
          "type": "series line",
          "description": "Second line object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "color",
          "type": "series color",
          "description": "The color used to fill the space between the lines.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'linefill.set_color': {
    name: 'linefill.set_color',
    syntax: "linefill.set_color(id, color) → void",
    description: "The function sets the color of the linefill object passed to it.",
    requiredParams: ["id"],
    optionalParams: ["color"],
    signature: "linefill.set_color(id, color) → void",
    parameters: [
        {
          "name": "id",
          "type": "series linefill",
          "description": "A linefill object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "color",
          "type": "series color",
          "description": "The color of the linefill object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'log.error': {
    name: 'log.error',
    syntax: "log.error(message) → void",
    description: "Converts the formatting string and value(s) into a formatted string, and sends the result to the \"Pine logs\" menu tagged with the \"error\" debug level.",
    requiredParams: ["message"],
    optionalParams: [],
    signature: "log.error(message) → void",
    parameters: [
        {
          "name": "message",
          "type": "series string",
          "description": "Log message.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'log.info': {
    name: 'log.info',
    syntax: "log.info(message) → void",
    description: "Converts the formatting string and value(s) into a formatted string, and sends the result to the \"Pine logs\" menu tagged with the \"info\" debug level.",
    requiredParams: ["message"],
    optionalParams: [],
    signature: "log.info(message) → void",
    parameters: [
        {
          "name": "message",
          "type": "series string",
          "description": "Log message.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'log.warning': {
    name: 'log.warning',
    syntax: "log.warning(message) → void",
    description: "Converts the formatting string and value(s) into a formatted string, and sends the result to the \"Pine logs\" menu tagged with the \"warning\" debug level.",
    requiredParams: ["message"],
    optionalParams: [],
    signature: "log.warning(message) → void",
    parameters: [
        {
          "name": "message",
          "type": "series string",
          "description": "Log message.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'map.clear': {
    name: 'map.clear',
    syntax: "map.clear(id) → void",
    description: "Clears the map, removing all key-value pairs from it.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "map.clear(id) → void",
    parameters: [
        {
          "name": "id",
          "type": "any map type",
          "description": "A map object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'map.contains': {
    name: 'map.contains',
    syntax: "map.contains(id, key) → series bool",
    description: "Returns true if the key was found in the id map, false otherwise.",
    requiredParams: ["id"],
    optionalParams: ["key"],
    signature: "map.contains(id, key) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "any map type",
          "description": "A map object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "key",
          "type": "series <type of the map's elements>",
          "description": "The key to search in the map.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'map.copy': {
    name: 'map.copy',
    syntax: "map.copy(id) → map<keyType, valueType>",
    description: "Creates a copy of an existing map.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "map.copy(id) → map<keyType, valueType>",
    parameters: [
        {
          "name": "id",
          "type": "any map type",
          "description": "A map object to copy.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'map.get': {
    name: 'map.get',
    syntax: "map.get(id, key) → <value_type>",
    description: "Returns the value associated with the specified key in the id map.",
    requiredParams: ["id"],
    optionalParams: ["key"],
    signature: "map.get(id, key) → <value_type>",
    parameters: [
        {
          "name": "id",
          "type": "any map type",
          "description": "A map object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "key",
          "type": "series <type of the map's elements>",
          "description": "The key of the value to retrieve.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'map.keys': {
    name: 'map.keys',
    syntax: "map.keys(id) → array<type>",
    description: "Returns an array of all the keys in the id map. The resulting array is a copy and any changes to it are not reflected in the original map.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "map.keys(id) → array<type>",
    parameters: [
        {
          "name": "id",
          "type": "any map type",
          "description": "A map object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'map.new<type,type>': {
    name: 'map.new<type,type>',
    syntax: "map.new<keyType, valueType>() → map<keyType, valueType>",
    description: "Creates a new map object: a collection that consists of key-value pairs, where all keys are of the keyType, and all values are of the valueType.",
    requiredParams: [],
    optionalParams: [],
    signature: "map.new<keyType, valueType>() → map<keyType, valueType>",
    parameters: []
  },
  'map.put': {
    name: 'map.put',
    syntax: "map.put(id, key, value) → <value_type>",
    description: "Puts a new key-value pair into the id map.",
    requiredParams: ["id"],
    optionalParams: ["key","value"],
    signature: "map.put(id, key, value) → <value_type>",
    parameters: [
        {
          "name": "id",
          "type": "any map type",
          "description": "A map object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "key",
          "type": "series <type of the map's elements>",
          "description": "The key to put into the map.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "value",
          "type": "series <type of the map's elements>",
          "description": "The key value to put into the map.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'map.put_all': {
    name: 'map.put_all',
    syntax: "map.put_all(id, id2) → void",
    description: "Puts all key-value pairs from the id2 map into the id map.",
    requiredParams: ["id"],
    optionalParams: ["id2"],
    signature: "map.put_all(id, id2) → void",
    parameters: [
        {
          "name": "id",
          "type": "any map type",
          "description": "A map object to append to.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "id2",
          "type": "any map type",
          "description": "A map object to be appended.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'map.remove': {
    name: 'map.remove',
    syntax: "map.remove(id, key) → <value_type>",
    description: "Removes a key-value pair from the id map.",
    requiredParams: ["id"],
    optionalParams: ["key"],
    signature: "map.remove(id, key) → <value_type>",
    parameters: [
        {
          "name": "id",
          "type": "any map type",
          "description": "A map object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "key",
          "type": "series <type of the map's elements>",
          "description": "The key of the pair to remove from the map.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'map.size': {
    name: 'map.size',
    syntax: "map.size(id) → series int",
    description: "Returns the number of key-value pairs in the id map.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "map.size(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "any map type",
          "description": "A map object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'map.values': {
    name: 'map.values',
    syntax: "map.values(id) → array<type>",
    description: "Returns an array of all the values in the id map. The resulting array is a copy and any changes to it are not reflected in the original map.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "map.values(id) → array<type>",
    parameters: [
        {
          "name": "id",
          "type": "any map type",
          "description": "A map object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.abs': {
    name: 'math.abs',
    syntax: "math.abs(number) → const int",
    description: "Absolute value of number is number if number >= 0, or -number otherwise.",
    requiredParams: ["number"],
    optionalParams: [],
    signature: "math.abs(number) → const int",
    parameters: [
        {
          "name": "number",
          "type": "const int",
          "description": "The number to use in the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.acos': {
    name: 'math.acos',
    syntax: "math.acos(angle) → const float",
    description: "The acos function returns the arccosine (in radians) of number such that cos(acos(y)) = y for y in range [-1, 1].",
    requiredParams: ["angle"],
    optionalParams: [],
    signature: "math.acos(angle) → const float",
    parameters: [
        {
          "name": "angle",
          "type": "const int/float",
          "description": "The value, in radians, to use in the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.asin': {
    name: 'math.asin',
    syntax: "math.asin(angle) → const float",
    description: "The asin function returns the arcsine (in radians) of number such that sin(asin(y)) = y for y in range [-1, 1].",
    requiredParams: ["angle"],
    optionalParams: [],
    signature: "math.asin(angle) → const float",
    parameters: [
        {
          "name": "angle",
          "type": "const int/float",
          "description": "The value, in radians, to use in the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.atan': {
    name: 'math.atan',
    syntax: "math.atan(angle) → const float",
    description: "The atan function returns the arctangent (in radians) of number such that tan(atan(y)) = y for any y.",
    requiredParams: ["angle"],
    optionalParams: [],
    signature: "math.atan(angle) → const float",
    parameters: [
        {
          "name": "angle",
          "type": "const int/float",
          "description": "The value, in radians, to use in the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.avg': {
    name: 'math.avg',
    syntax: "math.avg(number0, number1, ...) → simple float",
    description: "Calculates average of all given series (elementwise).",
    requiredParams: [],
    optionalParams: [],
    signature: "math.avg(number0, number1, ...) → simple float",
    parameters: []
  },
  'math.ceil': {
    name: 'math.ceil',
    syntax: "math.ceil(number) → const int",
    description: "Rounds the specified number up to the smallest whole number (\"int\" value) that is greater than or equal to it.",
    requiredParams: ["number"],
    optionalParams: [],
    signature: "math.ceil(number) → const int",
    parameters: [
        {
          "name": "number",
          "type": "const int/float",
          "description": "The number to round.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.cos': {
    name: 'math.cos',
    syntax: "math.cos(angle) → const float",
    description: "The cos function returns the trigonometric cosine of an angle.",
    requiredParams: ["angle"],
    optionalParams: [],
    signature: "math.cos(angle) → const float",
    parameters: [
        {
          "name": "angle",
          "type": "const int/float",
          "description": "Angle, in radians.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.exp': {
    name: 'math.exp',
    syntax: "math.exp(number) → const float",
    description: "The exp function of number is e raised to the power of number, where e is Euler's number.",
    requiredParams: ["number"],
    optionalParams: [],
    signature: "math.exp(number) → const float",
    parameters: [
        {
          "name": "number",
          "type": "const int/float",
          "description": "The number to use in the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.floor': {
    name: 'math.floor',
    syntax: "math.floor(number) → const int",
    description: "Rounds the specified number down to the largest whole number (\"int\" value) that is less than or equal to it.",
    requiredParams: ["number"],
    optionalParams: [],
    signature: "math.floor(number) → const int",
    parameters: [
        {
          "name": "number",
          "type": "const int/float",
          "description": "The number to round.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.log': {
    name: 'math.log',
    syntax: "math.log(number) → const float",
    description: "Natural logarithm of any number > 0 is the unique y such that e^y = number.",
    requiredParams: ["number"],
    optionalParams: [],
    signature: "math.log(number) → const float",
    parameters: [
        {
          "name": "number",
          "type": "const int/float",
          "description": "The number to use in the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.log10': {
    name: 'math.log10',
    syntax: "math.log10(number) → const float",
    description: "The common (or base 10) logarithm of number is the power to which 10 must be raised to obtain the number. 10^y = number.",
    requiredParams: ["number"],
    optionalParams: [],
    signature: "math.log10(number) → const float",
    parameters: [
        {
          "name": "number",
          "type": "const int/float",
          "description": "The number to use in the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.max': {
    name: 'math.max',
    syntax: "math.max(number0, number1, ...) → const int",
    description: "Returns the greatest of multiple values.",
    requiredParams: [],
    optionalParams: [],
    signature: "math.max(number0, number1, ...) → const int",
    parameters: []
  },
  'math.min': {
    name: 'math.min',
    syntax: "math.min(number0, number1, ...) → const int",
    description: "Returns the smallest of multiple values.",
    requiredParams: [],
    optionalParams: [],
    signature: "math.min(number0, number1, ...) → const int",
    parameters: []
  },
  'math.pow': {
    name: 'math.pow',
    syntax: "math.pow(base, exponent) → const float",
    description: "Mathematical power function.",
    requiredParams: ["base"],
    optionalParams: ["exponent"],
    signature: "math.pow(base, exponent) → const float",
    parameters: [
        {
          "name": "base",
          "type": "const int/float",
          "description": "Specify the base to use.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "exponent",
          "type": "const int/float",
          "description": "Specifies the exponent.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'math.random': {
    name: 'math.random',
    syntax: "math.random(min, max, seed) → series float",
    description: "Returns a pseudo-random value. The function will generate a different sequence of values for each script execution. Using the same value for the optional seed argument will produce a repeatable sequence.",
    requiredParams: ["min"],
    optionalParams: ["max","seed"],
    signature: "math.random(min, max, seed) → series float",
    parameters: [
        {
          "name": "min",
          "type": "series int/float",
          "description": "The lower bound of the range of random values. The value is not included in the range. The default is 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "max",
          "type": "series int/float",
          "description": "The upper bound of the range of random values. The value is not included in the range. The default is 1.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "seed",
          "type": "series int",
          "description": "Optional argument. When the same seed is used, allows successive calls to the function to produce a repeatable set of values.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'math.round': {
    name: 'math.round',
    syntax: "math.round(number) → const int",
    description: "Returns the value of number rounded to the nearest integer, with ties rounding up. If the precision parameter is used, returns a float value rounded to that amount of decimal places.",
    requiredParams: ["number"],
    optionalParams: [],
    signature: "math.round(number) → const int",
    parameters: [
        {
          "name": "number",
          "type": "const int/float",
          "description": "The value to be rounded.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.round_to_mintick': {
    name: 'math.round_to_mintick',
    syntax: "math.round_to_mintick(number) → simple float",
    description: "Returns the value rounded to the symbol's mintick, i.e. the nearest value that can be divided by syminfo.mintick, without the remainder, with ties rounding up.",
    requiredParams: ["number"],
    optionalParams: [],
    signature: "math.round_to_mintick(number) → simple float",
    parameters: [
        {
          "name": "number",
          "type": "simple int/float",
          "description": "The value to be rounded.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.sign': {
    name: 'math.sign',
    syntax: "math.sign(number) → const float",
    description: "Sign (signum) of number is zero if number is zero, 1.0 if number is greater than zero, -1.0 if number is less than zero.",
    requiredParams: ["number"],
    optionalParams: [],
    signature: "math.sign(number) → const float",
    parameters: [
        {
          "name": "number",
          "type": "const int/float",
          "description": "The number to use in the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.sin': {
    name: 'math.sin',
    syntax: "math.sin(angle) → const float",
    description: "The sin function returns the trigonometric sine of an angle.",
    requiredParams: ["angle"],
    optionalParams: [],
    signature: "math.sin(angle) → const float",
    parameters: [
        {
          "name": "angle",
          "type": "const int/float",
          "description": "Angle, in radians.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.sqrt': {
    name: 'math.sqrt',
    syntax: "math.sqrt(number) → const float",
    description: "Square root of any number >= 0 is the unique y >= 0 such that y^2 = number.",
    requiredParams: ["number"],
    optionalParams: [],
    signature: "math.sqrt(number) → const float",
    parameters: [
        {
          "name": "number",
          "type": "const int/float",
          "description": "The number to use in the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.sum': {
    name: 'math.sum',
    syntax: "math.sum(source, length) → series float",
    description: "The sum function returns the sliding sum of last y values of x.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "math.sum(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'math.tan': {
    name: 'math.tan',
    syntax: "math.tan(angle) → const float",
    description: "The tan function returns the trigonometric tangent of an angle.",
    requiredParams: ["angle"],
    optionalParams: [],
    signature: "math.tan(angle) → const float",
    parameters: [
        {
          "name": "angle",
          "type": "const int/float",
          "description": "Angle, in radians.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.todegrees': {
    name: 'math.todegrees',
    syntax: "math.todegrees(radians) → series float",
    description: "Returns an approximately equivalent angle in degrees from an angle measured in radians.",
    requiredParams: ["radians"],
    optionalParams: [],
    signature: "math.todegrees(radians) → series float",
    parameters: [
        {
          "name": "radians",
          "type": "series int/float",
          "description": "Angle in radians.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'math.toradians': {
    name: 'math.toradians',
    syntax: "math.toradians(degrees) → series float",
    description: "Returns an approximately equivalent angle in radians from an angle measured in degrees.",
    requiredParams: ["degrees"],
    optionalParams: [],
    signature: "math.toradians(degrees) → series float",
    parameters: [
        {
          "name": "degrees",
          "type": "series int/float",
          "description": "Angle in degrees.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.add_col': {
    name: 'matrix.add_col',
    syntax: "matrix.add_col(id, column, array_id) → void",
    description: "Inserts a new column at the column index of the id matrix.",
    requiredParams: ["id"],
    optionalParams: ["column","array_id"],
    signature: "matrix.add_col(id, column, array_id) → void",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "The matrix object's ID (reference).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "Optional. The index of the new column. Must be a value from 0 to matrix.columns(id). All existing columns with indices that are greater than or equal to this value increase their index by one. The default is matrix.columns(id).",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "array_id",
          "type": "any array type",
          "description": "Optional. The ID of an array to use as the new column. If the matrix is empty, the array can be of any size. Otherwise, its size must equal matrix.rows(id). By default, the function inserts a column of na values.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'matrix.add_row': {
    name: 'matrix.add_row',
    syntax: "matrix.add_row(id, row, array_id) → void",
    description: "Inserts a new row at the row index of the id matrix.",
    requiredParams: ["id"],
    optionalParams: ["row","array_id"],
    signature: "matrix.add_row(id, row, array_id) → void",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "The matrix object's ID (reference).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "row",
          "type": "series int",
          "description": "Optional. The index of the new row. Must be a value from 0 to matrix.rows(id). All existing rows with indices that are greater than or equal to this value increase their index by one. The default is matrix.rows(id).",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "array_id",
          "type": "any array type",
          "description": "Optional. The ID of an array to use as the new row. If the matrix is empty, the array can be of any size. Otherwise, its size must equal matrix.columns(id). By default, the function inserts a row of na values.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'matrix.avg': {
    name: 'matrix.avg',
    syntax: "matrix.avg(id) → series float",
    description: "The function calculates the average of all elements in the matrix.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.avg(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.col': {
    name: 'matrix.col',
    syntax: "matrix.col(id, column) → array<type>",
    description: "The function creates a one-dimensional array from the elements of a matrix column.",
    requiredParams: ["id","column"],
    optionalParams: [],
    signature: "matrix.col(id, column) → array<type>",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "Index of the required column.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        }
      ]
  },
  'matrix.columns': {
    name: 'matrix.columns',
    syntax: "matrix.columns(id) → series int",
    description: "The function returns the number of columns in the matrix.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.columns(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.concat': {
    name: 'matrix.concat',
    syntax: "matrix.concat(id1, id2) → matrix<type>",
    description: "The function appends the m2 matrix to the m1 matrix.",
    requiredParams: ["id1"],
    optionalParams: ["id2"],
    signature: "matrix.concat(id1, id2) → matrix<type>",
    parameters: [
        {
          "name": "id1",
          "type": "any matrix type",
          "description": "Matrix object to concatenate into.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "id2",
          "type": "any matrix type",
          "description": "Matrix object whose elements will be appended to id1.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.copy': {
    name: 'matrix.copy',
    syntax: "matrix.copy(id) → matrix<type>",
    description: "The function creates a new matrix which is a copy of the original.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.copy(id) → matrix<type>",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object to copy.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.det': {
    name: 'matrix.det',
    syntax: "matrix.det(id) → series float",
    description: "The function returns the determinant of a square matrix.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.det(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.diff': {
    name: 'matrix.diff',
    syntax: "matrix.diff(id1, id2) → matrix<int>",
    description: "The function returns a new matrix resulting from the subtraction between matrices id1 and id2, or of matrix id1 and an id2 scalar (a numerical value).",
    requiredParams: ["id1"],
    optionalParams: ["id2"],
    signature: "matrix.diff(id1, id2) → matrix<int>",
    parameters: [
        {
          "name": "id1",
          "type": "matrix<int>",
          "description": "Matrix to subtract from.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "id2",
          "type": "series int/float/matrix<int>",
          "description": "Matrix object or a scalar value to be subtracted.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.eigenvalues': {
    name: 'matrix.eigenvalues',
    syntax: "matrix.eigenvalues(id) → array<float>",
    description: "The function returns an array containing the eigenvalues of a square matrix.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.eigenvalues(id) → array<float>",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.eigenvectors': {
    name: 'matrix.eigenvectors',
    syntax: "matrix.eigenvectors(id) → matrix<float>",
    description: "Returns a matrix of eigenvectors, in which each column is an eigenvector of the id matrix.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.eigenvectors(id) → matrix<float>",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.elements_count': {
    name: 'matrix.elements_count',
    syntax: "matrix.elements_count(id) → series int",
    description: "The function returns the total number of all matrix elements.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.elements_count(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.fill': {
    name: 'matrix.fill',
    syntax: "matrix.fill(id, value, from_row, to_row, from_column, to_column) → void",
    description: "The function fills a rectangular area of the id matrix defined by the indices from_column to to_column (not including it) and from_row to to_row(not including it) with the value.",
    requiredParams: ["id"],
    optionalParams: ["value","from_row","to_row","from_column","to_column"],
    signature: "matrix.fill(id, value, from_row, to_row, from_column, to_column) → void",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "value",
          "type": "series <type of the matrix's elements>",
          "description": "The value to fill with.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "from_row",
          "type": "series int",
          "description": "Row index from which the fill will begin (inclusive). Optional. The default value is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "to_row",
          "type": "series int",
          "description": "Row index where the fill will end (not inclusive). Optional. The default value is matrix.rows.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "from_column",
          "type": "series int",
          "description": "Column index from which the fill will begin (inclusive). Optional. The default value is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "to_column",
          "type": "series int",
          "description": "Column index where the fill will end (non inclusive). Optional. The default value is matrix.columns.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'matrix.get': {
    name: 'matrix.get',
    syntax: "matrix.get(id, row, column) → <matrix_type>",
    description: "The function returns the element with the specified index of the matrix.",
    requiredParams: ["id","row","column"],
    optionalParams: [],
    signature: "matrix.get(id, row, column) → <matrix_type>",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "row",
          "type": "series int",
          "description": "Index of the required row.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "column",
          "type": "series int",
          "description": "Index of the required column.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        }
      ]
  },
  'matrix.inv': {
    name: 'matrix.inv',
    syntax: "matrix.inv(id) → matrix<float>",
    description: "The function returns the inverse of a square matrix.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.inv(id) → matrix<float>",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.is_antidiagonal': {
    name: 'matrix.is_antidiagonal',
    syntax: "matrix.is_antidiagonal(id) → series bool",
    description: "The function determines if the matrix is anti-diagonal (all elements outside the secondary diagonal are zero).",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.is_antidiagonal(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "Matrix object to test.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.is_antisymmetric': {
    name: 'matrix.is_antisymmetric',
    syntax: "matrix.is_antisymmetric(id) → series bool",
    description: "The function determines if a matrix is antisymmetric (its transpose equals its negative).",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.is_antisymmetric(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "Matrix object to test.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.is_binary': {
    name: 'matrix.is_binary',
    syntax: "matrix.is_binary(id) → series bool",
    description: "The function determines if the matrix is binary (when all elements of the matrix are 0 or 1).",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.is_binary(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "Matrix object to test.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.is_diagonal': {
    name: 'matrix.is_diagonal',
    syntax: "matrix.is_diagonal(id) → series bool",
    description: "The function determines if the matrix is diagonal (all elements outside the main diagonal are zero).",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.is_diagonal(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "Matrix object to test.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.is_identity': {
    name: 'matrix.is_identity',
    syntax: "matrix.is_identity(id) → series bool",
    description: "The function determines if a matrix is an identity matrix (elements with ones on the main diagonal and zeros elsewhere).",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.is_identity(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "Matrix object to test.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.is_square': {
    name: 'matrix.is_square',
    syntax: "matrix.is_square(id) → series bool",
    description: "The function determines if the matrix is square (it has the same number of rows and columns).",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.is_square(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "Matrix object to test.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.is_stochastic': {
    name: 'matrix.is_stochastic',
    syntax: "matrix.is_stochastic(id) → series bool",
    description: "The function determines if the matrix is stochastic.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.is_stochastic(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "Matrix object to test.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.is_symmetric': {
    name: 'matrix.is_symmetric',
    syntax: "matrix.is_symmetric(id) → series bool",
    description: "The function determines if a square matrix is symmetric (elements are symmetric with respect to the main diagonal).",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.is_symmetric(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "Matrix object to test.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.is_triangular': {
    name: 'matrix.is_triangular',
    syntax: "matrix.is_triangular(id) → series bool",
    description: "The function determines if the matrix is triangular (if all elements above or below the main diagonal are zero).",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.is_triangular(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "Matrix object to test.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.is_zero': {
    name: 'matrix.is_zero',
    syntax: "matrix.is_zero(id) → series bool",
    description: "The function determines if all elements of the matrix are zero.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.is_zero(id) → series bool",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "Matrix object to check.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.kron': {
    name: 'matrix.kron',
    syntax: "matrix.kron(id1, id2) → matrix<float>",
    description: "The function returns the Kronecker product for the id1 and id2 matrices.",
    requiredParams: ["id1"],
    optionalParams: ["id2"],
    signature: "matrix.kron(id1, id2) → matrix<float>",
    parameters: [
        {
          "name": "id1",
          "type": "matrix<int/float>",
          "description": "First matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "id2",
          "type": "matrix<int/float>",
          "description": "Second matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.max': {
    name: 'matrix.max',
    syntax: "matrix.max(id) → series float",
    description: "The function returns the largest value from the matrix elements.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.max(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.median': {
    name: 'matrix.median',
    syntax: "matrix.median(id) → series float",
    description: "The function calculates the median (\"the middle\" value) of matrix elements.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.median(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.min': {
    name: 'matrix.min',
    syntax: "matrix.min(id) → series float",
    description: "The function returns the smallest value from the matrix elements.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.min(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.mode': {
    name: 'matrix.mode',
    syntax: "matrix.mode(id) → series float",
    description: "The function calculates the mode of the matrix, which is the most frequently occurring value from the matrix elements. When there are multiple values occurring equally frequently, the function returns the smallest of those values.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.mode(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.mult': {
    name: 'matrix.mult',
    syntax: "matrix.mult(id1, id2) → array<int>",
    description: "The function returns a new matrix resulting from the product between the matrices id1 and id2, or between an id1 matrix and an id2 scalar (a numerical value), or between an id1 matrix and an id2 vector (an array of values).",
    requiredParams: ["id1"],
    optionalParams: ["id2"],
    signature: "matrix.mult(id1, id2) → array<int>",
    parameters: [
        {
          "name": "id1",
          "type": "matrix<int>",
          "description": "First matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "id2",
          "type": "array<int>",
          "description": "Second matrix object, value or array.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.new<type>': {
    name: 'matrix.new<type>',
    syntax: "matrix.new<type>(rows, columns, initial_value) → matrix<type>",
    description: "The function creates a new matrix object. A matrix is a two-dimensional data structure containing rows and columns. All elements in the matrix must be of the type specified in the type template (\"<type>\").",
    requiredParams: [],
    optionalParams: ["rows","columns","initial_value"],
    signature: "matrix.new<type>(rows, columns, initial_value) → matrix<type>",
    parameters: [
        {
          "name": "rows",
          "type": "series int",
          "description": "Initial row count of the matrix. Optional. The default value is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "columns",
          "type": "series int",
          "description": "Initial column count of the matrix. Optional. The default value is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_value",
          "type": "<matrix_type>",
          "description": "Initial value of all matrix elements. Optional. The default is 'na'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'matrix.pinv': {
    name: 'matrix.pinv',
    syntax: "matrix.pinv(id) → matrix<float>",
    description: "The function returns the pseudoinverse of a matrix.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.pinv(id) → matrix<float>",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.pow': {
    name: 'matrix.pow',
    syntax: "matrix.pow(id, power) → matrix<float>",
    description: "The function calculates the product of the matrix by itself power times.",
    requiredParams: ["id"],
    optionalParams: ["power"],
    signature: "matrix.pow(id, power) → matrix<float>",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "power",
          "type": "series int",
          "description": "The number of times the matrix will be multiplied by itself.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.rank': {
    name: 'matrix.rank',
    syntax: "matrix.rank(id) → series int",
    description: "The function calculates the rank of the matrix.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.rank(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.remove_col': {
    name: 'matrix.remove_col',
    syntax: "matrix.remove_col(id, column) → array<type>",
    description: "The function removes the column at column index of the id matrix and returns an array containing the removed column's values.",
    requiredParams: ["id"],
    optionalParams: ["column"],
    signature: "matrix.remove_col(id, column) → array<type>",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the column to be removed. Optional. The default value is matrix.columns.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'matrix.remove_row': {
    name: 'matrix.remove_row',
    syntax: "matrix.remove_row(id, row) → array<type>",
    description: "The function removes the row at row index of the id matrix and returns an array containing the removed row's values.",
    requiredParams: ["id"],
    optionalParams: ["row"],
    signature: "matrix.remove_row(id, row) → array<type>",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the row to be deleted. Optional. The default value is matrix.rows.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'matrix.reshape': {
    name: 'matrix.reshape',
    syntax: "matrix.reshape(id, rows, columns) → void",
    description: "The function rebuilds the id matrix to rows x cols dimensions.",
    requiredParams: ["id"],
    optionalParams: ["rows","columns"],
    signature: "matrix.reshape(id, rows, columns) → void",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "rows",
          "type": "series int",
          "description": "The number of rows of the reshaped matrix.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "columns",
          "type": "series int",
          "description": "The number of columns of the reshaped matrix.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.reverse': {
    name: 'matrix.reverse',
    syntax: "matrix.reverse(id) → void",
    description: "The function reverses the order of rows and columns in the matrix id. The first row and first column become the last, and the last become the first.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.reverse(id) → void",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.row': {
    name: 'matrix.row',
    syntax: "matrix.row(id, row) → array<type>",
    description: "The function creates a one-dimensional array from the elements of a matrix row.",
    requiredParams: ["id","row"],
    optionalParams: [],
    signature: "matrix.row(id, row) → array<type>",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "row",
          "type": "series int",
          "description": "Index of the required row.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        }
      ]
  },
  'matrix.rows': {
    name: 'matrix.rows',
    syntax: "matrix.rows(id) → series int",
    description: "The function returns the number of rows in the matrix.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.rows(id) → series int",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.set': {
    name: 'matrix.set',
    syntax: "matrix.set(id, row, column, value) → void",
    description: "The function assigns value to the element at the row and column of the id matrix.",
    requiredParams: ["id"],
    optionalParams: ["row","column","value"],
    signature: "matrix.set(id, row, column, value) → void",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The row index of the element to be modified.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The column index of the element to be modified.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "value",
          "type": "series <type of the matrix's elements>",
          "description": "The new value to be set.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.sort': {
    name: 'matrix.sort',
    syntax: "matrix.sort(id, column, order) → void",
    description: "The function rearranges the rows in the id matrix following the sorted order of the values in the column.",
    requiredParams: ["id"],
    optionalParams: ["column","order"],
    signature: "matrix.sort(id, column, order) → void",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float/string>",
          "description": "A matrix object to be sorted.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "Index of the column whose sorted values determine the new order of rows. Optional. The default value is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "order",
          "type": "series sort_order",
          "description": "The sort order. Possible values: order.ascending (default), order.descending.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.submatrix': {
    name: 'matrix.submatrix',
    syntax: "matrix.submatrix(id, from_row, to_row, from_column, to_column) → matrix<type>",
    description: "The function extracts a submatrix of the id matrix within the specified indices.",
    requiredParams: ["id"],
    optionalParams: ["from_row","to_row","from_column","to_column"],
    signature: "matrix.submatrix(id, from_row, to_row, from_column, to_column) → matrix<type>",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "from_row",
          "type": "series int",
          "description": "Index of the row from which the extraction will begin (inclusive). Optional. The default value is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "to_row",
          "type": "series int",
          "description": "Index of the row where the extraction will end (non inclusive). Optional. The default value is matrix.rows.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "from_column",
          "type": "series int",
          "description": "Index of the column from which the extraction will begin (inclusive). Optional. The default value is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "to_column",
          "type": "series int",
          "description": "Index of the column where the extraction will end (non inclusive). Optional. The default value is matrix.columns.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'matrix.sum': {
    name: 'matrix.sum',
    syntax: "matrix.sum(id1, id2) → matrix<int>",
    description: "The function returns a new matrix resulting from the sum of two matrices id1 and id2, or of an id1 matrix and an id2 scalar (a numerical value).",
    requiredParams: ["id1"],
    optionalParams: ["id2"],
    signature: "matrix.sum(id1, id2) → matrix<int>",
    parameters: [
        {
          "name": "id1",
          "type": "matrix<int>",
          "description": "First matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "id2",
          "type": "series int/float/matrix<int>",
          "description": "Second matrix object, or scalar value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.swap_columns': {
    name: 'matrix.swap_columns',
    syntax: "matrix.swap_columns(id, column1, column2) → void",
    description: "The function swaps the columns at the index column1 and column2 in the id matrix.",
    requiredParams: ["id"],
    optionalParams: ["column1","column2"],
    signature: "matrix.swap_columns(id, column1, column2) → void",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column1",
          "type": "series int",
          "description": "Index of the first column to be swapped.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "column2",
          "type": "series int",
          "description": "Index of the second column to be swapped.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.swap_rows': {
    name: 'matrix.swap_rows',
    syntax: "matrix.swap_rows(id, row1, row2) → void",
    description: "The function swaps the rows at the index row1 and row2 in the id matrix.",
    requiredParams: ["id"],
    optionalParams: ["row1","row2"],
    signature: "matrix.swap_rows(id, row1, row2) → void",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "row1",
          "type": "series int",
          "description": "Index of the first row to be swapped.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row2",
          "type": "series int",
          "description": "Index of the second row to be swapped.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'matrix.trace': {
    name: 'matrix.trace',
    syntax: "matrix.trace(id) → series float",
    description: "The function calculates the trace of a matrix (the sum of the main diagonal's elements).",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.trace(id) → series float",
    parameters: [
        {
          "name": "id",
          "type": "matrix<int/float>",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'matrix.transpose': {
    name: 'matrix.transpose',
    syntax: "matrix.transpose(id) → matrix<type>",
    description: "The function creates a new, transposed version of the id. This interchanges the row and column index of each element.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "matrix.transpose(id) → matrix<type>",
    parameters: [
        {
          "name": "id",
          "type": "any matrix type",
          "description": "A matrix object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'max_bars_back': {
    name: 'max_bars_back',
    syntax: "max_bars_back(var, num) → void",
    description: "Function sets the maximum number of bars that is available for historical reference of a given built-in or user variable. When operator '[]' is applied to a variable - it is a reference to a historical value of that variable.",
    requiredParams: ["var"],
    optionalParams: ["num"],
    signature: "max_bars_back(var, num) → void",
    parameters: [
        {
          "name": "var",
          "type": "series int/float/bool/color/label/line",
          "description": "Series variable identifier for which history buffer should be resized. Possible values are: 'open', 'high', 'low', 'close', 'volume', 'time', or any user defined variable id.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "num",
          "type": "const int",
          "description": "History buffer size which is the number of bars that could be referenced for variable 'var'.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'minute': {
    name: 'minute',
    syntax: "minute(time, timezone) → series int",
    description: "time (series int) UNIX time in milliseconds.",
    requiredParams: ["time"],
    optionalParams: ["timezone"],
    signature: "minute(time, timezone) → series int",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "UNIX time in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "timezone",
          "type": "series string",
          "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'month': {
    name: 'month',
    syntax: "month(time, timezone) → series int",
    description: "time (series int) UNIX time in milliseconds.",
    requiredParams: ["time"],
    optionalParams: ["timezone"],
    signature: "month(time, timezone) → series int",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "UNIX time in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "timezone",
          "type": "series string",
          "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'na': {
    name: 'na',
    syntax: "na(x) → simple bool",
    description: "Tests if x is na.",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "na(x) → simple bool",
    parameters: [
        {
          "name": "x",
          "type": "simple int/float",
          "description": "Value to be tested.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'nz': {
    name: 'nz',
    syntax: "nz(source, replacement) → simple color",
    description: "Replaces na (undefined) values with either a type-specific default value or a specified replacement.",
    requiredParams: ["source"],
    optionalParams: ["replacement"],
    signature: "nz(source, replacement) → simple color",
    parameters: [
        {
          "name": "source",
          "type": "simple color",
          "description": "The source series to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "replacement",
          "type": "simple color",
          "description": "Optional. The value the function uses to replace na values in the source series. The default depends on the source type: 0 for \"int\", 0.0 for \"float\", or #00000000 for \"color\".",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'plot': {
    name: 'plot',
    syntax: "plot(series, title, color, linewidth, style, trackprice, histbase, offset, join, editable, show_last, display, format, precision, force_overlay, linestyle) → plot",
    description: "Plots a series of data on the chart.",
    requiredParams: ["series"],
    optionalParams: ["title","color","linewidth","style","trackprice","histbase","offset","join","editable","show_last","display","format","precision","force_overlay","linestyle"],
    signature: "plot(series, title, color, linewidth, style, trackprice, histbase, offset, join, editable, show_last, display, format, precision, force_overlay, linestyle) → plot",
    parameters: [
        {
          "name": "series",
          "type": "series int/float",
          "description": "Series of data to be plotted. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the plot.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "color",
          "type": "series color",
          "description": "Color of the plot. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "linewidth",
          "type": "input int",
          "description": "Width of the plotted line. Default value is 1. Not applicable to every style.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "style",
          "type": "input plot_style",
          "description": "Type of plot. Possible values are: plot.style_line, plot.style_stepline, plot.style_stepline_diamond, plot.style_histogram, plot.style_cross, plot.style_area, plot.style_columns, plot.style_circles, plot.style_linebr, plot.style_areabr, plot.style_steplinebr. Default value is plot.style_line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "trackprice",
          "type": "input bool",
          "description": "If true then a horizontal price line will be shown at the level of the last indicator value. Default is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "histbase",
          "type": "input int/float",
          "description": "The price value used as the reference level when rendering plot with plot.style_histogram, plot.style_columns or plot.style_area style. Default is 0.0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "offset",
          "type": "simple int",
          "description": "Shifts the plot to the left or to the right on the given number of bars. Default is 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "join",
          "type": "input bool",
          "description": "If true then plot points will be joined with line, applicable only to plot.style_cross and plot.style_circles styles. Default is false.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "editable",
          "type": "input bool",
          "description": "If true then plot style will be editable in Format dialog. Default is true.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "show_last",
          "type": "input int",
          "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "display",
          "type": "input plot_display",
          "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "format",
          "type": "input string",
          "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator, and strategy functions. Optional. The default is the format value used by the indicator/strategy function. Possible values: format.price, format.percent, format.volume.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "precision",
          "type": "input int",
          "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator and strategy functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator/strategy function.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "linestyle",
          "type": "input plot_line_style",
          "description": "Optional. A modifier for plot styles that display lines. It specifies whether the plotted line is solid (plot.linestyle_solid), dashed (plot.linestyle_dashed), or dotted (plot.linestyle_dotted). The modifier applies only when the function uses one of the following style arguments: plot.style_line, plot.style_linebr, plot.style_stepline, plot.style_stepline_diamond, and plot.style_area. The default is plot.linestyle_solid.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'plotarrow': {
    name: 'plotarrow',
    syntax: "plotarrow(series, title, colorup, colordown, offset, minheight, maxheight, editable, show_last, display, format, precision, force_overlay) → void",
    description: "Plots up and down arrows on the chart. Up arrow is drawn at every indicator positive value, down arrow is drawn at every negative value. If indicator returns na then no arrow is drawn. Arrows has different height, the more absolute indicator value the longer arrow is drawn.",
    requiredParams: ["series"],
    optionalParams: ["title","colorup","colordown","offset","minheight","maxheight","editable","show_last","display","format","precision","force_overlay"],
    signature: "plotarrow(series, title, colorup, colordown, offset, minheight, maxheight, editable, show_last, display, format, precision, force_overlay) → void",
    parameters: [
        {
          "name": "series",
          "type": "series int/float",
          "description": "Series of data to be plotted as arrows. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the plot.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "colorup",
          "type": "series color",
          "description": "Color of the up arrows. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "colordown",
          "type": "series color",
          "description": "Color of the down arrows. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "offset",
          "type": "simple int",
          "description": "Shifts arrows to the left or to the right on the given number of bars. Default is 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "minheight",
          "type": "input int",
          "description": "Minimal possible arrow height in pixels. Default is 5.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "maxheight",
          "type": "input int",
          "description": "Maximum possible arrow height in pixels. Default is 100.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "editable",
          "type": "input bool",
          "description": "If true then plotarrow style will be editable in Format dialog. Default is true.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "show_last",
          "type": "input int",
          "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "display",
          "type": "input plot_display",
          "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "format",
          "type": "input string",
          "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator, and strategy functions. Optional. The default is the format value used by the indicator/strategy function. Possible values: format.price, format.percent, format.volume.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "precision",
          "type": "input int",
          "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator and strategy functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator/strategy function.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'plotbar': {
    name: 'plotbar',
    syntax: "plotbar(open, high, low, close, title, color, editable, show_last, display, format, precision, force_overlay) → void",
    description: "Plots ohlc bars on the chart.",
    requiredParams: ["open","high","low","close"],
    optionalParams: ["title","color","editable","show_last","display","format","precision","force_overlay"],
    signature: "plotbar(open, high, low, close, title, color, editable, show_last, display, format, precision, force_overlay) → void",
    parameters: [
        {
          "name": "open",
          "type": "series int/float",
          "description": "Open series of data to be used as open values of bars. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "high",
          "type": "series int/float",
          "description": "High series of data to be used as high values of bars. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "low",
          "type": "series int/float",
          "description": "Low series of data to be used as low values of bars. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "close",
          "type": "series int/float",
          "description": "Close series of data to be used as close values of bars. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the plotbar. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "color",
          "type": "series color",
          "description": "Color of the ohlc bars. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "editable",
          "type": "input bool",
          "description": "If true then plotbar style will be editable in Format dialog. Default is true.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "show_last",
          "type": "input int",
          "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "display",
          "type": "input plot_display",
          "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "format",
          "type": "input string",
          "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator, and strategy functions. Optional. The default is the format value used by the indicator/strategy function. Possible values: format.price, format.percent, format.volume.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "precision",
          "type": "input int",
          "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator and strategy functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator/strategy function.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'plotcandle': {
    name: 'plotcandle',
    syntax: "plotcandle(open, high, low, close, title, color, wickcolor, editable, show_last, bordercolor, display, format, precision, force_overlay) → void",
    description: "Plots candles on the chart.",
    requiredParams: ["open","high","low","close"],
    optionalParams: ["title","color","wickcolor","editable","show_last","bordercolor","display","format","precision","force_overlay"],
    signature: "plotcandle(open, high, low, close, title, color, wickcolor, editable, show_last, bordercolor, display, format, precision, force_overlay) → void",
    parameters: [
        {
          "name": "open",
          "type": "series int/float",
          "description": "Open series of data to be used as open values of candles. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "high",
          "type": "series int/float",
          "description": "High series of data to be used as high values of candles. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "low",
          "type": "series int/float",
          "description": "Low series of data to be used as low values of candles. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "close",
          "type": "series int/float",
          "description": "Close series of data to be used as close values of candles. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the plotcandles. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "color",
          "type": "series color",
          "description": "Color of the candles. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "wickcolor",
          "type": "series color",
          "description": "The color of the wick of candles. An optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "editable",
          "type": "input bool",
          "description": "If true then plotcandle style will be editable in Format dialog. Default is true.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "show_last",
          "type": "input int",
          "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "bordercolor",
          "type": "series color",
          "description": "The border color of candles. An optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "display",
          "type": "input plot_display",
          "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "format",
          "type": "input string",
          "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator, and strategy functions. Optional. The default is the format value used by the indicator/strategy function. Possible values: format.price, format.percent, format.volume.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "precision",
          "type": "input int",
          "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator and strategy functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator/strategy function.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'plotchar': {
    name: 'plotchar',
    syntax: "plotchar(series, title, char, location, color, offset, text, textcolor, editable, size, show_last, display, format, precision, force_overlay) → void",
    description: "Plots visual shapes using any given one Unicode character on the chart.",
    requiredParams: ["series"],
    optionalParams: ["title","char","location","color","offset","text","textcolor","editable","size","show_last","display","format","precision","force_overlay"],
    signature: "plotchar(series, title, char, location, color, offset, text, textcolor, editable, size, show_last, display, format, precision, force_overlay) → void",
    parameters: [
        {
          "name": "series",
          "type": "series int/float/bool",
          "description": "Series of data to be plotted as shapes. Series is treated as a series of boolean values for all location values except location.absolute. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the plot.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "char",
          "type": "input string",
          "description": "Character to use as a visual shape.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "location",
          "type": "input string",
          "description": "Location of shapes on the chart. Possible values are: location.abovebar, location.belowbar, location.top, location.bottom, location.absolute. Default value is location.abovebar.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "color",
          "type": "series color",
          "description": "Color of the shapes. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "offset",
          "type": "simple int",
          "description": "Shifts shapes to the left or to the right on the given number of bars. Default is 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text",
          "type": "const string",
          "description": "Text to display with the shape. You can use multiline text, to separate lines use '\\n' escape sequence. Example: 'line one\\nline two'.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "textcolor",
          "type": "series color",
          "description": "Color of the text. You can use constants like 'textcolor=color.red' or 'textcolor=#ff001a' as well as complex expressions like 'textcolor = close >= open ? color.green : color.red'. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "editable",
          "type": "input bool",
          "description": "If true then plotchar style will be editable in Format dialog. Default is true.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "size",
          "type": "const string",
          "description": "Size of characters on the chart. Possible values are: size.auto, size.tiny, size.small, size.normal, size.large, size.huge. Default is size.auto.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "show_last",
          "type": "input int",
          "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "display",
          "type": "input plot_display",
          "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "format",
          "type": "input string",
          "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator, and strategy functions. Optional. The default is the format value used by the indicator/strategy function. Possible values: format.price, format.percent, format.volume.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "precision",
          "type": "input int",
          "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator and strategy functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator/strategy function.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'plotshape': {
    name: 'plotshape',
    syntax: "plotshape(series, title, style, location, color, offset, text, textcolor, editable, size, show_last, display, format, precision, force_overlay) → void",
    description: "Plots visual shapes on the chart.",
    requiredParams: ["series"],
    optionalParams: ["title","style","location","color","offset","text","textcolor","editable","size","show_last","display","format","precision","force_overlay"],
    signature: "plotshape(series, title, style, location, color, offset, text, textcolor, editable, size, show_last, display, format, precision, force_overlay) → void",
    parameters: [
        {
          "name": "series",
          "type": "series int/float/bool",
          "description": "Series of data to be plotted as shapes. Series is treated as a series of boolean values for all location values except location.absolute. Required argument.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "title",
          "type": "const string",
          "description": "Title of the plot.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "style",
          "type": "input string",
          "description": "Type of plot. Possible values are: shape.xcross, shape.cross, shape.triangleup, shape.triangledown, shape.flag, shape.circle, shape.arrowup, shape.arrowdown, shape.labelup, shape.labeldown, shape.square, shape.diamond. Default value is shape.xcross.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "location",
          "type": "input string",
          "description": "Location of shapes on the chart. Possible values are: location.abovebar, location.belowbar, location.top, location.bottom, location.absolute. Default value is location.abovebar.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "color",
          "type": "series color",
          "description": "Color of the shapes. You can use constants like 'color=color.red' or 'color=#ff001a' as well as complex expressions like 'color = close >= open ? color.green : color.red'. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "offset",
          "type": "simple int",
          "description": "Shifts shapes to the left or to the right on the given number of bars. Default is 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text",
          "type": "const string",
          "description": "Text to display with the shape. You can use multiline text, to separate lines use '\\n' escape sequence. Example: 'line one\\nline two'.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "textcolor",
          "type": "series color",
          "description": "Color of the text. You can use constants like 'textcolor=color.red' or 'textcolor=#ff001a' as well as complex expressions like 'textcolor = close >= open ? color.green : color.red'. Optional argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "editable",
          "type": "input bool",
          "description": "If true then plotshape style will be editable in Format dialog. Default is true.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "size",
          "type": "const string",
          "description": "Size of shapes on the chart. Possible values are: size.auto, size.tiny, size.small, size.normal, size.large, size.huge. Default is size.auto.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "show_last",
          "type": "input int",
          "description": "Optional. The number of bars, counting backwards from the most recent bar, on which the function can draw.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "display",
          "type": "input plot_display",
          "description": "Controls where the plot's information is displayed. Display options support addition and subtraction, meaning that using display.all - display.status_line will display the plot's information everywhere except in the script's status line. display.price_scale + display.status_line will display the plot only in the price scale and status line. When display arguments such as display.price_scale have user-controlled chart settings equivalents, the relevant plot information will only appear when all settings allow for it. Possible values: display.none, display.pane, display.data_window, display.price_scale, display.status_line, display.all. Optional. The default is display.all.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "format",
          "type": "input string",
          "description": "Determines whether the script formats the plot's values as prices, percentages, or volume values. The argument passed to this parameter supersedes the format parameter of the indicator, and strategy functions. Optional. The default is the format value used by the indicator/strategy function. Possible values: format.price, format.percent, format.volume.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "precision",
          "type": "input int",
          "description": "The number of digits after the decimal point the plot's values show on the chart pane's y-axis, the script's status line, and the Data Window. Accepts a non-negative integer less than or equal to 16. The argument passed to this parameter supersedes the precision parameter of the indicator and strategy functions. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is the precision value used by the indicator/strategy function.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the plotted results will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'polyline.delete': {
    name: 'polyline.delete',
    syntax: "polyline.delete(id) → void",
    description: "Deletes the specified polyline object. It has no effect if the id doesn't exist.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "polyline.delete(id) → void",
    parameters: [
        {
          "name": "id",
          "type": "series polyline",
          "description": "The polyline ID to delete.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'polyline.new': {
    name: 'polyline.new',
    syntax: "polyline.new(points, curved, closed, xloc, line_color, fill_color, line_style, line_width, force_overlay) → series polyline",
    description: "Creates a new polyline instance and displays it on the chart, sequentially connecting all of the points in the points array with line segments. The segments in the drawing can be straight or curved depending on the curved parameter.",
    requiredParams: ["points"],
    optionalParams: ["curved","closed","xloc","line_color","fill_color","line_style","line_width","force_overlay"],
    signature: "polyline.new(points, curved, closed, xloc, line_color, fill_color, line_style, line_width, force_overlay) → series polyline",
    parameters: [
        {
          "name": "points",
          "type": "array<chart.point>",
          "description": "An array of chart.point objects for the drawing to sequentially connect.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "curved",
          "type": "series bool",
          "description": "If true, the drawing will connect all points from the points array using curved line segments. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "closed",
          "type": "series bool",
          "description": "If true, the drawing will also connect the first point to the last point from the points array, resulting in a closed polyline. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "xloc",
          "type": "series string",
          "description": "Determines the field of the chart.point objects in the points array that the polyline will use for its x-coordinates. If xloc.bar_index, the polyline will use the index field from each point. If xloc.bar_time, it will use the time field. Optional. The default is xloc.bar_index.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "line_color",
          "type": "series color",
          "description": "The color of the line segments. Optional. The default is color.blue.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "fill_color",
          "type": "series color",
          "description": "The fill color of the polyline. Optional. The default is na.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "line_style",
          "type": "series string",
          "description": "The style of the polyline. Possible values: line.style_solid, line.style_dotted, line.style_dashed, line.style_arrow_left, line.style_arrow_right, line.style_arrow_both. Optional. The default is line.style_solid.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "line_width",
          "type": "series int",
          "description": "The width of the line segments, expressed in pixels. Optional. The default is 1.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the drawing will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'request.currency_rate': {
    name: 'request.currency_rate',
    syntax: "request.currency_rate(from, to, ignore_invalid_currency) → series float",
    description: "Provides a daily rate that can be used to convert a value expressed in the from currency to another in the to currency.",
    requiredParams: ["from"],
    optionalParams: ["to","ignore_invalid_currency"],
    signature: "request.currency_rate(from, to, ignore_invalid_currency) → series float",
    parameters: [
        {
          "name": "from",
          "type": "series string",
          "description": "The currency in which the value to be converted is expressed. Possible values: a three-letter string with the currency code in the ISO 4217 format (e.g. \"USD\"), or one of the built-in variables that return currency codes, like syminfo.currency or currency.USD.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "to",
          "type": "series string",
          "description": "The currency in which the value is to be converted. Possible values: a three-letter string with the currency code in the ISO 4217 format (e.g. \"USD\"), or one of the built-in variables that return currency codes, like syminfo.currency or currency.USD.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "ignore_invalid_currency",
          "type": "series bool",
          "description": "Determines the behavior of the function if a conversion rate between the two currencies cannot be calculated: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'request.dividends': {
    name: 'request.dividends',
    syntax: "request.dividends(ticker, field, gaps, lookahead, ignore_invalid_symbol, currency) → series float",
    description: "Requests dividends data for the specified symbol.",
    requiredParams: ["ticker"],
    optionalParams: ["field","gaps","lookahead","ignore_invalid_symbol","currency"],
    signature: "request.dividends(ticker, field, gaps, lookahead, ignore_invalid_symbol, currency) → series float",
    parameters: [
        {
          "name": "ticker",
          "type": "series string",
          "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\". Using syminfo.ticker will cause an error. Use syminfo.tickerid instead.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "field",
          "type": "series string",
          "description": "Input string. Possible values include: dividends.net, dividends.gross. Default value is dividends.gross.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "gaps",
          "type": "simple barmerge_gaps",
          "description": "Merge strategy for the requested data (requested data automatically merges with the main series OHLC data). Possible values: barmerge.gaps_on, barmerge.gaps_off. barmerge.gaps_on - requested data is merged with possible gaps (na values). barmerge.gaps_off - requested data is merged continuously without gaps, all the gaps are filled with the previous nearest existing values. Default value is barmerge.gaps_off.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "lookahead",
          "type": "simple barmerge_lookahead",
          "description": "Merge strategy for the requested data position. Possible values: barmerge.lookahead_on, barmerge.lookahead_off. Default value is barmerge.lookahead_off starting from version 3. Note that behavour is the same on real-time, and differs only on history.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "ignore_invalid_symbol",
          "type": "input bool",
          "description": "An optional parameter. Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. The default value is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "currency",
          "type": "series string",
          "description": "Currency into which the symbol's currency-related dividends values (e.g. dividends.gross) are to be converted. The conversion rate depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'request.earnings': {
    name: 'request.earnings',
    syntax: "request.earnings(ticker, field, gaps, lookahead, ignore_invalid_symbol, currency) → series float",
    description: "Requests earnings data for the specified symbol.",
    requiredParams: ["ticker"],
    optionalParams: ["field","gaps","lookahead","ignore_invalid_symbol","currency"],
    signature: "request.earnings(ticker, field, gaps, lookahead, ignore_invalid_symbol, currency) → series float",
    parameters: [
        {
          "name": "ticker",
          "type": "series string",
          "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\". Using syminfo.ticker will cause an error. Use syminfo.tickerid instead.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "field",
          "type": "series string",
          "description": "Input string. Possible values include: earnings.actual, earnings.estimate, earnings.standardized. Default value is earnings.actual.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "gaps",
          "type": "simple barmerge_gaps",
          "description": "Merge strategy for the requested data (requested data automatically merges with the main series OHLC data). Possible values: barmerge.gaps_on, barmerge.gaps_off. barmerge.gaps_on - requested data is merged with possible gaps (na values). barmerge.gaps_off - requested data is merged continuously without gaps, all the gaps are filled with the previous nearest existing values. Default value is barmerge.gaps_off.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "lookahead",
          "type": "simple barmerge_lookahead",
          "description": "Merge strategy for the requested data position. Possible values: barmerge.lookahead_on, barmerge.lookahead_off. Default value is barmerge.lookahead_off starting from version 3. Note that behavour is the same on real-time, and differs only on history.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "ignore_invalid_symbol",
          "type": "input bool",
          "description": "An optional parameter. Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. The default value is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "currency",
          "type": "series string",
          "description": "Currency into which the symbol's currency-related earnings values (e.g. earnings.actual) are to be converted. The conversion rate depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'request.economic': {
    name: 'request.economic',
    syntax: "request.economic(country_code, field, gaps, ignore_invalid_symbol) → series float",
    description: "Requests economic data for a symbol. Economic data includes information such as the state of a country's economy (GDP, inflation rate, etc.) or of a particular industry (steel production, ICU beds, etc.).",
    requiredParams: ["country_code"],
    optionalParams: ["field","gaps","ignore_invalid_symbol"],
    signature: "request.economic(country_code, field, gaps, ignore_invalid_symbol) → series float",
    parameters: [
        {
          "name": "country_code",
          "type": "series string",
          "description": "The code of the country (e.g. \"US\") or the region (e.g. \"EU\") for which the economic data is requested. The Help Center article lists the countries and their codes. The countries for which information is available vary with metrics. The Help Center article for each metric lists the countries for which the metric is available.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "field",
          "type": "series string",
          "description": "The code of the requested economic metric (e.g., \"GDP\"). The Help Center article lists the metrics and their codes.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "gaps",
          "type": "simple barmerge_gaps",
          "description": "Specifies how the returned values are merged on chart bars. Possible values: barmerge.gaps_off, barmerge.gaps_on. With barmerge.gaps_on, a value only appears on the current chart bar when it first becomes available from the function's context, otherwise na is returned (thus a \"gap\" occurs). With barmerge.gaps_off, what would otherwise be gaps are filled with the latest known value returned, avoiding na values. Optional. The default is barmerge.gaps_off.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "ignore_invalid_symbol",
          "type": "input bool",
          "description": "Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'request.financial': {
    name: 'request.financial',
    syntax: "request.financial(symbol, financial_id, period, gaps, ignore_invalid_symbol, currency) → series float",
    description: "Requests financial series for symbol.",
    requiredParams: ["symbol"],
    optionalParams: ["financial_id","period","gaps","ignore_invalid_symbol","currency"],
    signature: "request.financial(symbol, financial_id, period, gaps, ignore_invalid_symbol, currency) → series float",
    parameters: [
        {
          "name": "symbol",
          "type": "series string",
          "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\".",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "financial_id",
          "type": "series string",
          "description": "Financial identifier. You can find the list of available ids via our Help Center.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "period",
          "type": "series string",
          "description": "Reporting period. Possible values are \"TTM\", \"FY\", \"FQ\", \"FH\", \"D\".",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "gaps",
          "type": "simple barmerge_gaps",
          "description": "Merge strategy for the requested data (requested data automatically merges with the main series: OHLC data). Possible values include: barmerge.gaps_on, barmerge.gaps_off. barmerge.gaps_on - requested data is merged with possible gaps (na values). barmerge.gaps_off - requested data is merged continuously without gaps, all the gaps are filled with the previous, nearest existing values. Default value is barmerge.gaps_off.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "ignore_invalid_symbol",
          "type": "input bool",
          "description": "An optional parameter. Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. The default value is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "currency",
          "type": "series string",
          "description": "Optional. Currency into which the symbol's financial metrics (e.g. Net Income) are to be converted. The conversion rate depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'request.quandl': {
    name: 'request.quandl',
    syntax: "request.quandl(ticker, gaps, index, ignore_invalid_symbol) → series float",
    description: "Note: This function has been deprecated due to the API change from NASDAQ Data Link. Requests for \"QUANDL\" symbols are no longer valid and requests for them return a runtime error.",
    requiredParams: ["ticker"],
    optionalParams: ["gaps","index","ignore_invalid_symbol"],
    signature: "request.quandl(ticker, gaps, index, ignore_invalid_symbol) → series float",
    parameters: [
        {
          "name": "ticker",
          "type": "series string",
          "description": "Symbol. Note that the name of a time series and Quandl data feed should be divided by a forward slash. For example: \"CFTC/SB_FO_ALL\".",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "gaps",
          "type": "simple barmerge_gaps",
          "description": "Merge strategy for the requested data (requested data automatically merges with the main series: OHLC data). Possible values include: barmerge.gaps_on, barmerge.gaps_off. barmerge.gaps_on - requested data is merged with possible gaps (na values). barmerge.gaps_off - requested data is merged continuously without gaps, all the gaps are filled with the previous, nearest existing values. Default value is barmerge.gaps_off.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "index",
          "type": "series int",
          "description": "A Quandl time-series column index.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "ignore_invalid_symbol",
          "type": "input bool",
          "description": "An optional parameter. Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. The default value is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'request.security': {
    name: 'request.security',
    syntax: "request.security(symbol, timeframe, expression, gaps, lookahead, ignore_invalid_symbol, currency, calc_bars_count) → series <type>",
    description: "Requests the result of an expression from a specified context (symbol and timeframe).",
    requiredParams: ["symbol"],
    optionalParams: ["timeframe","expression","gaps","lookahead","ignore_invalid_symbol","currency","calc_bars_count"],
    signature: "request.security(symbol, timeframe, expression, gaps, lookahead, ignore_invalid_symbol, currency, calc_bars_count) → series <type>",
    parameters: [
        {
          "name": "symbol",
          "type": "series string",
          "description": "Symbol or ticker identifier of the requested data. Use an empty string or syminfo.tickerid to request data using the chart's symbol. To retrieve data with additional modifiers (extended sessions, dividend adjustments, non-standard chart types like Heikin Ashi and Renko, etc.), create a custom ticker ID for the request using the functions in the ticker.* namespace.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "timeframe",
          "type": "series string",
          "description": "Timeframe of the requested data. Use an empty string or timeframe.period to request data from the chart's timeframe or the timeframe specified in the indicator function. To request data from a different timeframe, supply a valid timeframe string. See here to learn about specifying timeframe strings.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "expression",
          "type": "variable, function, object, array, matrix, or map of series int/float/bool/string/color/enum, or a tuple of these",
          "description": "The expression to calculate and return from the requested context. It can accept a built-in variable like close, a user-defined variable, an expression such as ta.change(close) / (high - low), a function call that does not use Pine Script® drawings, an object, a collection, or a tuple of expressions.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "gaps",
          "type": "simple barmerge_gaps",
          "description": "Specifies how the returned values are merged on chart bars. Possible values: barmerge.gaps_on, barmerge.gaps_off. With barmerge.gaps_on a value only appears on the current chart bar when it first becomes available from the function's context, otherwise na is returned (thus a \"gap\" occurs). With barmerge.gaps_off what would otherwise be gaps are filled with the latest known value returned, avoiding na values. Optional. The default is barmerge.gaps_off.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "lookahead",
          "type": "simple barmerge_lookahead",
          "description": "On historical bars only, returns data from the timeframe before it elapses. Possible values: barmerge.lookahead_on, barmerge.lookahead_off. Has no effect on realtime values. Optional. The default is barmerge.lookahead_off starting from Pine Script® v3. The default is barmerge.lookahead_on in v1 and v2. WARNING: Using barmerge.lookahead_on at timeframes higher than the chart's without offsetting the expression argument like in close[1] will introduce future leak in scripts, as the function will then return the close price before it is actually known in the current context. As is explained in the User Manual's page on Repainting this will produce misleading results.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "ignore_invalid_symbol",
          "type": "input bool",
          "description": "Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and throw a runtime error; if true, the function will return na and execution will continue. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "currency",
          "type": "series string",
          "description": "Optional. Specifies the target currency for converting values expressed in currency units (e.g., open, high, low, close) or expressions involving such values. Literal values such as 200 are not converted. The conversion rate for monetary values depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "calc_bars_count",
          "type": "simple int",
          "description": "Optional. Determines the maximum number of recent historical bars that the function can request. If specified, the function evaluates the expression argument starting from that number of bars behind the last historical bar in the requested dataset, treating those bars as the only available data. Limiting the number of historical bars in a request can help improve calculation efficiency in some cases. The default is 100,000 bars, which is the maximum number of bars that non-professional plans can request. See the Intrabars section of the User Manual's Limitations page to learn more about requested bar limits.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'request.security_lower_tf': {
    name: 'request.security_lower_tf',
    syntax: "request.security_lower_tf(symbol, timeframe, expression, ignore_invalid_symbol, currency, ignore_invalid_timeframe, calc_bars_count) → array<type>",
    description: "Requests the results of an expression from a specified symbol on a timeframe lower than or equal to the chart's timeframe. It returns an array containing one element for each lower-timeframe bar within the chart bar. On a 5-minute chart, requesting data using a timeframe argument of \"1\" typically returns an array with five elements representing the value of the expression on each 1-minute bar, ordered by time with the earliest value first.",
    requiredParams: ["symbol"],
    optionalParams: ["timeframe","expression","ignore_invalid_symbol","currency","ignore_invalid_timeframe","calc_bars_count"],
    signature: "request.security_lower_tf(symbol, timeframe, expression, ignore_invalid_symbol, currency, ignore_invalid_timeframe, calc_bars_count) → array<type>",
    parameters: [
        {
          "name": "symbol",
          "type": "series string",
          "description": "Symbol or ticker identifier of the requested data. Use an empty string or syminfo.tickerid to request data using the chart's symbol. To retrieve data with additional modifiers (extended sessions, dividend adjustments, non-standard chart types like Heikin Ashi and Renko, etc.), create a custom ticker ID for the request using the functions in the ticker.* namespace.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "timeframe",
          "type": "series string",
          "description": "Timeframe of the requested data. Use an empty string or timeframe.period to request data from the chart's timeframe or the timeframe specified in the indicator function. To request data from a different timeframe, supply a valid timeframe string. See here to learn about specifying timeframe strings.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "expression",
          "type": "variable, object or function of series int/float/bool/string/color/enum, or a tuple of these",
          "description": "The expression to calculate and return from the requested context. It can accept a built-in variable like close, a user-defined variable, an expression such as ta.change(close) / (high - low), a function call that does not use Pine Script® drawings, an object, or a tuple of expressions. Collections are not allowed unless they are within the fields of an object",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "ignore_invalid_symbol",
          "type": "series bool",
          "description": "Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and throw a runtime error; if true, the function will return na and execution will continue. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "currency",
          "type": "series string",
          "description": "Optional. Specifies the target currency for converting values expressed in currency units (e.g., open, high, low, close) or expressions involving such values. Literal values such as 200 are not converted. The conversion rate for monetary values depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "ignore_invalid_timeframe",
          "type": "series bool",
          "description": "Determines the behavior of the function when the chart's timeframe is smaller than the timeframe used in the function call. If false, the script will halt and throw a runtime error. If true, the function will return na and execution will continue. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "calc_bars_count",
          "type": "simple int",
          "description": "Optional. Determines the maximum number of recent historical bars that the function can request. If specified, the function evaluates the expression argument starting from that number of bars behind the last historical bar in the requested dataset, treating those bars as the only available data. Limiting the number of historical bars in a request can help improve calculation efficiency in some cases. The default is 100,000 bars, which is the maximum number of bars that non-professional plans can request. See the Intrabars section of the User Manual's Limitations page to learn more about requested bar limits.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'request.seed': {
    name: 'request.seed',
    syntax: "request.seed(source, symbol, expression, ignore_invalid_symbol, calc_bars_count) → series <type>",
    description: "Requests the result of an expression evaluated on data from a user-maintained GitHub repository. **Note:**The creation of new Pine Seeds repositories is suspended; only existing repositories are currently supported. See the Pine Seeds documentation on GitHub to learn more.",
    requiredParams: ["source"],
    optionalParams: ["symbol","expression","ignore_invalid_symbol","calc_bars_count"],
    signature: "request.seed(source, symbol, expression, ignore_invalid_symbol, calc_bars_count) → series <type>",
    parameters: [
        {
          "name": "source",
          "type": "series string",
          "description": "Name of the GitHub repository.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "symbol",
          "type": "series string",
          "description": "Name of the file in the GitHub repository containing the data. The \".csv\" file extension must not be included.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "expression",
          "type": "<arg_expr_type>",
          "description": "An expression to be calculated and returned from the requested symbol's context. It can be a built-in variable like close, an expression such as ta.sma(close, 100), a non-mutable variable previously calculated in the script, a function call that does not use Pine Script® drawings, an array, a matrix, or a tuple. Mutable variables are not allowed, unless they are enclosed in the body of a function used in the expression.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "ignore_invalid_symbol",
          "type": "input bool",
          "description": "Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and throw a runtime error; if true, the function will return na and execution will continue. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "calc_bars_count",
          "type": "simple int",
          "description": "Optional. If specified, the function requests only this number of values from the end of the symbol's history and calculates expression as if these values are the only available data, which might improve calculation speed in some cases. The default is 100,000. For information about the bar limits for different TradingView plans, see the Chart bars section of the Limitations page in the User Manual.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'request.splits': {
    name: 'request.splits',
    syntax: "request.splits(ticker, field, gaps, lookahead, ignore_invalid_symbol) → series float",
    description: "Requests splits data for the specified symbol.",
    requiredParams: ["ticker"],
    optionalParams: ["field","gaps","lookahead","ignore_invalid_symbol"],
    signature: "request.splits(ticker, field, gaps, lookahead, ignore_invalid_symbol) → series float",
    parameters: [
        {
          "name": "ticker",
          "type": "series string",
          "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\". Using syminfo.ticker will cause an error. Use syminfo.tickerid instead.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "field",
          "type": "series string",
          "description": "Input string. Possible values include: splits.denominator, splits.numerator.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "gaps",
          "type": "simple barmerge_gaps",
          "description": "Merge strategy for the requested data (requested data automatically merges with the main series OHLC data). Possible values: barmerge.gaps_on, barmerge.gaps_off. barmerge.gaps_on - requested data is merged with possible gaps (na values). barmerge.gaps_off - requested data is merged continuously without gaps, all the gaps are filled with the previous nearest existing values. Default value is barmerge.gaps_off.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "lookahead",
          "type": "simple barmerge_lookahead",
          "description": "Merge strategy for the requested data position. Possible values: barmerge.lookahead_on, barmerge.lookahead_off. Default value is barmerge.lookahead_off starting from version 3. Note that behavour is the same on real-time, and differs only on history.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "ignore_invalid_symbol",
          "type": "input bool",
          "description": "An optional parameter. Determines the behavior of the function if the specified symbol is not found: if false, the script will halt and return a runtime error; if true, the function will return na and execution will continue. The default value is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'runtime.error': {
    name: 'runtime.error',
    syntax: "runtime.error(message) → void",
    description: "When called, causes a runtime error with the error message specified in the message argument.",
    requiredParams: ["message"],
    optionalParams: [],
    signature: "runtime.error(message) → void",
    parameters: [
        {
          "name": "message",
          "type": "series string",
          "description": "Error message.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'second': {
    name: 'second',
    syntax: "second(time, timezone) → series int",
    description: "time (series int) UNIX time in milliseconds.",
    requiredParams: ["time"],
    optionalParams: ["timezone"],
    signature: "second(time, timezone) → series int",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "UNIX time in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "timezone",
          "type": "series string",
          "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'str.contains': {
    name: 'str.contains',
    syntax: "str.contains(source, str) → const bool",
    description: "Returns true if the source string contains the str substring, false otherwise.",
    requiredParams: ["source"],
    optionalParams: ["str"],
    signature: "str.contains(source, str) → const bool",
    parameters: [
        {
          "name": "source",
          "type": "const string",
          "description": "Source string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "str",
          "type": "const string",
          "description": "The substring to search for.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'str.endswith': {
    name: 'str.endswith',
    syntax: "str.endswith(source, str) → const bool",
    description: "Returns true if the source string ends with the substring specified in str, false otherwise.",
    requiredParams: ["source"],
    optionalParams: ["str"],
    signature: "str.endswith(source, str) → const bool",
    parameters: [
        {
          "name": "source",
          "type": "const string",
          "description": "Source string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "str",
          "type": "const string",
          "description": "The substring to search for.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'str.format': {
    name: 'str.format',
    syntax: "str.format(formatString, arg0, arg1, ...) → simple string",
    description: "Creates a formatted string using a specified formatting string (formatString) and one or more additional arguments (arg0, arg1, etc.). The formatting string defines the structure of the returned string, where all placeholders in curly brackets ({}) refer to the additional arguments. Each placeholder requires a number representing an argument's position, starting from 0. For instance, the placeholder {0} refers to the first argument after formatString (arg0), {1} refers to the second (arg1), and so on. The function replaces each placeholder with a string representation of the corresponding argument.",
    requiredParams: ["formatString"],
    optionalParams: [],
    signature: "str.format(formatString, arg0, arg1, ...) → simple string",
    parameters: [
        {
          "name": "formatString",
          "type": "simple string",
          "description": "Format string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'str.format_time': {
    name: 'str.format_time',
    syntax: "str.format_time(time, format, timezone) → series string",
    description: "Converts the time timestamp into a string formatted according to format and timezone.",
    requiredParams: ["time"],
    optionalParams: ["format","timezone"],
    signature: "str.format_time(time, format, timezone) → series string",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "UNIX time, in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "format",
          "type": "series string",
          "description": "A format string specifying the date/time representation of the time in the returned string. All letters used in the string, except those escaped by single quotation marks ', are considered formatting tokens and will be used as a formatting instruction. Refer to the Remarks section for a list of the most useful tokens. Optional. The default is \"yyyy-MM-dd'T'HH:mm:ssZ\", which represents the ISO 8601 standard.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "timezone",
          "type": "series string",
          "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'str.length': {
    name: 'str.length',
    syntax: "str.length(string) → const int",
    description: "Returns an integer corresponding to the amount of chars in that string.",
    requiredParams: ["string"],
    optionalParams: [],
    signature: "str.length(string) → const int",
    parameters: [
        {
          "name": "string",
          "type": "const string",
          "description": "Source string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'str.lower': {
    name: 'str.lower',
    syntax: "str.lower(source) → const string",
    description: "Returns a new string with all letters converted to lowercase.",
    requiredParams: ["source"],
    optionalParams: [],
    signature: "str.lower(source) → const string",
    parameters: [
        {
          "name": "source",
          "type": "const string",
          "description": "String to be converted.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'str.match': {
    name: 'str.match',
    syntax: "str.match(source, regex) → simple string",
    description: "Returns the new substring of the source string if it matches a regex regular expression, an empty string otherwise.",
    requiredParams: ["source"],
    optionalParams: ["regex"],
    signature: "str.match(source, regex) → simple string",
    parameters: [
        {
          "name": "source",
          "type": "simple string",
          "description": "Source string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "regex",
          "type": "simple string",
          "description": "The regular expression to which this string is to be matched.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'str.pos': {
    name: 'str.pos',
    syntax: "str.pos(source, str) → const int",
    description: "Returns the position of the first occurrence of the str string in the source string, 'na' otherwise.",
    requiredParams: ["source"],
    optionalParams: ["str"],
    signature: "str.pos(source, str) → const int",
    parameters: [
        {
          "name": "source",
          "type": "const string",
          "description": "Source string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "str",
          "type": "const string",
          "description": "The substring to search for.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'str.repeat': {
    name: 'str.repeat',
    syntax: "str.repeat(source, repeat, separator) → const string",
    description: "Constructs a new string containing the source string repeated repeat times with the separator injected between each repeated instance.",
    requiredParams: ["source"],
    optionalParams: ["repeat","separator"],
    signature: "str.repeat(source, repeat, separator) → const string",
    parameters: [
        {
          "name": "source",
          "type": "const string",
          "description": "String to repeat.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "repeat",
          "type": "const int",
          "description": "Number of times to repeat the source string. Must be greater than or equal to 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "separator",
          "type": "const string",
          "description": "String to inject between repeated values. Optional. The default is empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'str.replace': {
    name: 'str.replace',
    syntax: "str.replace(source, target, replacement, occurrence) → const string",
    description: "Returns a new string with the Nth occurrence of the target string replaced by the replacement string, where N is specified in occurrence.",
    requiredParams: ["source"],
    optionalParams: ["target","replacement","occurrence"],
    signature: "str.replace(source, target, replacement, occurrence) → const string",
    parameters: [
        {
          "name": "source",
          "type": "const string",
          "description": "Source string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "target",
          "type": "const string",
          "description": "String to be replaced.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "replacement",
          "type": "const string",
          "description": "String to be inserted instead of the target string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "occurrence",
          "type": "const int",
          "description": "N-th occurrence of the target string to replace. Indexing starts at 0 for the first match. Optional. Default value is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'str.replace_all': {
    name: 'str.replace_all',
    syntax: "str.replace_all(source, target, replacement) → simple string",
    description: "Replaces each occurrence of the target string in the source string with the replacement string.",
    requiredParams: ["source"],
    optionalParams: ["target","replacement"],
    signature: "str.replace_all(source, target, replacement) → simple string",
    parameters: [
        {
          "name": "source",
          "type": "simple string",
          "description": "Source string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "target",
          "type": "simple string",
          "description": "String to be replaced.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "replacement",
          "type": "simple string",
          "description": "String to be substituted for each occurrence of target string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'str.split': {
    name: 'str.split',
    syntax: "str.split(string, separator) → array<string>",
    description: "Divides a string into an array of substrings and returns its array id.",
    requiredParams: ["string"],
    optionalParams: ["separator"],
    signature: "str.split(string, separator) → array<string>",
    parameters: [
        {
          "name": "string",
          "type": "series string",
          "description": "Source string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "separator",
          "type": "series string",
          "description": "The string separating each substring.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'str.startswith': {
    name: 'str.startswith',
    syntax: "str.startswith(source, str) → const bool",
    description: "Returns true if the source string starts with the substring specified in str, false otherwise.",
    requiredParams: ["source"],
    optionalParams: ["str"],
    signature: "str.startswith(source, str) → const bool",
    parameters: [
        {
          "name": "source",
          "type": "const string",
          "description": "Source string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "str",
          "type": "const string",
          "description": "The substring to search for.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'str.substring': {
    name: 'str.substring',
    syntax: "str.substring(source, begin_pos, end_pos) → const string",
    description: "Returns a new string that is a substring of the source string. The substring begins with the character at the index specified by begin_pos and extends to 'end_pos - 1' of the source string.",
    requiredParams: ["source"],
    optionalParams: ["begin_pos","end_pos"],
    signature: "str.substring(source, begin_pos, end_pos) → const string",
    parameters: [
        {
          "name": "source",
          "type": "const string",
          "description": "Source string from which to extract the substring.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "begin_pos",
          "type": "const int",
          "description": "The beginning position of the extracted substring. It is inclusive (the extracted substring includes the character at that position).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "end_pos",
          "type": "const int",
          "description": "The ending position. It is exclusive (the extracted string does NOT include that position's character). Optional. The default is the length of the source string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'str.tonumber': {
    name: 'str.tonumber',
    syntax: "str.tonumber(string) → const float",
    description: "Converts a value represented in string to its \"float\" equivalent.",
    requiredParams: ["string"],
    optionalParams: [],
    signature: "str.tonumber(string) → const float",
    parameters: [
        {
          "name": "string",
          "type": "const string",
          "description": "String containing the representation of an integer or floating point value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'str.tostring': {
    name: 'str.tostring',
    syntax: "str.tostring(value, format) → simple string",
    description: "value (simple int/float) Value or array ID whose elements are converted to a string.",
    requiredParams: ["value"],
    optionalParams: ["format"],
    signature: "str.tostring(value, format) → simple string",
    parameters: [
        {
          "name": "value",
          "type": "simple int/float",
          "description": "Value or array ID whose elements are converted to a string.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "format",
          "type": "simple string",
          "description": "Format string. Accepts these format.* constants: format.mintick, format.percent, format.volume. Optional. The default value is '#.##########'.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'str.trim': {
    name: 'str.trim',
    syntax: "str.trim(source) → const string",
    description: "Constructs a new string with all consecutive whitespaces and other control characters (e.g., “\\n”, “\\t”, etc.) removed from the left and right of the source.",
    requiredParams: ["source"],
    optionalParams: [],
    signature: "str.trim(source) → const string",
    parameters: [
        {
          "name": "source",
          "type": "const string",
          "description": "String to trim.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'str.upper': {
    name: 'str.upper',
    syntax: "str.upper(source) → const string",
    description: "Returns a new string with all letters converted to uppercase.",
    requiredParams: ["source"],
    optionalParams: [],
    signature: "str.upper(source) → const string",
    parameters: [
        {
          "name": "source",
          "type": "const string",
          "description": "String to be converted.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy': {
    name: 'strategy',
    syntax: "strategy(title, shorttitle, overlay, format, precision, scale, pyramiding, calc_on_order_fills, calc_on_every_tick, max_bars_back, backtest_fill_limits_assumption, default_qty_type, default_qty_value, initial_capital, currency, slippage, commission_type, commission_value, process_orders_on_close, close_entries_rule, margin_long, margin_short, explicit_plot_zorder, max_lines_count, max_labels_count, max_boxes_count, calc_bars_count, risk_free_rate, use_bar_magnifier, fill_orders_on_standard_ohlc, max_polylines_count, dynamic_requests, behind_chart) → void",
    description: "This declaration statement designates the script as a strategy and sets a number of strategy-related properties.",
    requiredParams: ["title","max_bars_back"],
    optionalParams: ["shorttitle","overlay","format","precision","scale","pyramiding","calc_on_order_fills","calc_on_every_tick","backtest_fill_limits_assumption","default_qty_type","default_qty_value","initial_capital","currency","slippage","commission_type","commission_value","process_orders_on_close","close_entries_rule","margin_long","margin_short","explicit_plot_zorder","max_lines_count","max_labels_count","max_boxes_count","calc_bars_count","risk_free_rate","use_bar_magnifier","fill_orders_on_standard_ohlc","max_polylines_count","dynamic_requests","behind_chart"],
    signature: "strategy(title, shorttitle, overlay, format, precision, scale, pyramiding, calc_on_order_fills, calc_on_every_tick, max_bars_back, backtest_fill_limits_assumption, default_qty_type, default_qty_value, initial_capital, currency, slippage, commission_type, commission_value, process_orders_on_close, close_entries_rule, margin_long, margin_short, explicit_plot_zorder, max_lines_count, max_labels_count, max_boxes_count, calc_bars_count, risk_free_rate, use_bar_magnifier, fill_orders_on_standard_ohlc, max_polylines_count, dynamic_requests, behind_chart) → void",
    parameters: [
        {
          "name": "title",
          "type": "const string",
          "description": "The title of the script. It is displayed on the chart when no shorttitle argument is used, and becomes the publication's default title when publishing the script.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "shorttitle",
          "type": "const string",
          "description": "The script's display name on charts. If specified, it will replace the title argument in most chart-related windows. Optional. The default is the argument used for title.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "overlay",
          "type": "const bool",
          "description": "If true, the script's visuals appear on the main chart pane if the user adds it to the chart directly, or in another script's pane if the user applies it to that script. If false, the script's visuals appear in a separate pane. Changes to the overlay value apply only after the user adds the script to the chart again. Additionally, if the user moves the script to another pane by selecting a \"Move to\" option in the script's \"More\" menu, it does not move back to its original pane after any updates to the source code. The default is false.  Strategy-specific labels that display entries and exits will be displayed over the main chart regardless of this setting.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "format",
          "type": "const string",
          "description": "Specifies the formatting of the script's displayed values. Possible values: format.inherit, format.price, format.volume, format.percent. Optional. The default is format.inherit.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "precision",
          "type": "const int",
          "description": "Specifies the number of digits after the floating point of the script's displayed values. Must be a non-negative integer no greater than 16. If format is set to format.inherit and precision is specified, the format will instead be set to format.price. When the function's format parameter uses format.volume, the precision parameter will not affect the result, as the decimal precision rules defined by format.volume supersede other precision settings. Optional. The default is inherited from the precision of the chart's symbol.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "scale",
          "type": "const scale_type",
          "description": "The price scale used. Possible values: scale.right, scale.left, scale.none. The scale.none value can only be applied in combination with overlay = true. Optional. By default, the script uses the same scale as the chart.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "pyramiding",
          "type": "const int",
          "description": "The maximum number of entries allowed in the same direction. If the value is 0, only one entry order in the same direction can be opened, and additional entry orders are rejected. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "calc_on_order_fills",
          "type": "const bool",
          "description": "Specifies whether the strategy should be recalculated after an order is filled. If true, the strategy recalculates after an order is filled, as opposed to recalculating only when the bar closes. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "calc_on_every_tick",
          "type": "const bool",
          "description": "Specifies whether the strategy should be recalculated on each realtime tick. If true, when the strategy is running on a realtime bar, it will recalculate on each chart update. If false, the strategy only calculates when the realtime bar closes. The argument used does not affect strategy calculation on historical data. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "max_bars_back",
          "type": "const int",
          "description": "The length of the historical buffer the script keeps for every variable and function, which determines how many past values can be referenced using the [] history-referencing operator. The required buffer size is automatically detected by the Pine Script® runtime. Using this parameter is only necessary when a runtime error occurs because automatic detection fails. More information on the underlying mechanics of the historical buffer can be found in our Help Center. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "backtest_fill_limits_assumption",
          "type": "const int",
          "description": "Limit order execution threshold in ticks. When it is used, limit orders are only filled if the market price exceeds the order's limit level by the specified number of ticks. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "default_qty_type",
          "type": "const string",
          "description": "Specifies the units used for default_qty_value. Possible values are: strategy.fixed for contracts/shares/lots, strategy.cash for currency amounts, or strategy.percent_of_equity for a percentage of available equity. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is strategy.fixed.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "default_qty_value",
          "type": "const int/float",
          "description": "The default quantity to trade, in units determined by the argument used with the default_qty_type parameter. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is 1.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "initial_capital",
          "type": "const int/float",
          "description": "The amount of funds initially available for the strategy to trade, in units of currency. Optional. The default is 1000000.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "currency",
          "type": "const string",
          "description": "Currency used by the strategy in currency-related calculations. Market positions are still opened by converting currency into the chart symbol's currency. The conversion rate depends on the previous daily value of a corresponding currency pair from the most popular exchange. A spread symbol is used if no exchange provides the rate directly. Possible values: a \"string\" representing a valid currency code (e.g., \"USD\" or \"USDT\") or a constant from the currency.* namespace (e.g., currency.USD or currency.USDT). The default is syminfo.currency.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "slippage",
          "type": "const int",
          "description": "Slippage expressed in ticks. This value is added to or subtracted from the fill price of market/stop orders to make the fill price less favorable for the strategy. E.g., if syminfo.mintick is 0.01 and slippage is set to 5, a long market order will enter at 5 * 0.01 = 0.05 points above the actual price. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "commission_type",
          "type": "const string",
          "description": "Determines what the number passed to the commission_value expresses: strategy.commission.percent for a percentage of the cash volume of the order, strategy.commission.cash_per_contract for currency per contract, strategy.commission.cash_per_order for currency per order. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is strategy.commission.percent.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "commission_value",
          "type": "const int/float",
          "description": "Commission applied to the strategy's orders in units determined by the argument passed to the commission_type parameter. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "process_orders_on_close",
          "type": "const bool",
          "description": "When set to true, generates an additional attempt to execute orders after a bar closes and strategy calculations are completed. If the orders are market orders, the broker emulator executes them before the next bar's open. If the orders are price-dependent, they will only be filled if the price conditions are met. This option is useful if you wish to close positions on the current bar. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "close_entries_rule",
          "type": "const string",
          "description": "Determines the order in which trades are closed. Possible values are: \"FIFO\" (First-In, First-Out) if the earliest exit order must close the earliest entry order, or \"ANY\" if the orders are closed based on the from_entry parameter of the strategy.exit function. \"FIFO\" can only be used with stocks, futures and US forex (NFA Compliance Rule 2-43b), while \"ANY\" is allowed in non-US forex. Optional. The default is \"FIFO\".",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "margin_long",
          "type": "const int/float",
          "description": "Margin long is the percentage of the purchase price of a security that must be covered by cash or collateral for long positions. Must be a non-negative number. The logic used to simulate margin calls is explained in the Help Center. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. If the value is 0, the strategy does not enforce any limits on position size. The default is 100, in which case the strategy only uses its own funds and the long positions cannot be margin called.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "margin_short",
          "type": "const int/float",
          "description": "Margin short is the percentage of the purchase price of a security that must be covered by cash or collateral for short positions. Must be a non-negative number. The logic used to simulate margin calls is explained in the Help Center. This setting can also be changed in the strategy's \"Settings/Properties\" tab. Optional. If the value is 0, the strategy does not enforce any limits on position size. The default is 100, in which case the strategy only uses its own funds. Note that even with no margin used, short positions can be margin called if the loss exceeds available funds.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "explicit_plot_zorder",
          "type": "const bool",
          "description": "Specifies the order in which the script's plots, fills, and hlines are rendered. If true, plots are drawn in the order in which they appear in the script's code, each newer plot being drawn above the previous ones. This only applies to plot*() functions, fill, and hline. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "max_lines_count",
          "type": "const int",
          "description": "The number of last line drawings displayed. Possible values: 1-500. Optional. The default is 50.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "max_labels_count",
          "type": "const int",
          "description": "The number of last label drawings displayed. Possible values: 1-500. Optional. The default is 50.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "max_boxes_count",
          "type": "const int",
          "description": "The number of last box drawings displayed. Possible values: 1-500. Optional. The default is 50.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "calc_bars_count",
          "type": "const int",
          "description": "Limits the initial calculation of a script to the last number of bars specified. When specified, a \"Calculated bars\" field will be included in the \"Calculation\" section of the script's \"Settings/Inputs\" tab. Optional. The default is 0, in which case the script executes on all available bars.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "risk_free_rate",
          "type": "const int/float",
          "description": "The risk-free rate of return is the annual percentage change in the value of an investment with minimal or zero risk. It is used to calculate the Sharpe and Sortino ratios. Optional. The default is 2.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "use_bar_magnifier",
          "type": "const bool",
          "description": "Optional. When true, the Broker Emulator uses lower timeframe data during backtesting on historical bars to achieve more realistic results. The default is false. Only Premium and higher-tier plans have access to this feature.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "fill_orders_on_standard_ohlc",
          "type": "const bool",
          "description": "When true, forces strategies running on Heikin Ashi charts to fill orders using actual OHLC prices, for more realistic results. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "max_polylines_count",
          "type": "const int",
          "description": "The number of last polyline drawings displayed. Possible values: 1-100. The count is approximate; more drawings than the specified count may be displayed. Optional. The default is 50.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "dynamic_requests",
          "type": "const bool",
          "description": "Specifies whether the script can dynamically call functions from the request.*() namespace. Dynamic request.*() calls are allowed within the local scopes of conditional structures (e.g., if), loops (e.g., for), and exported functions. Additionally, such calls allow \"series\" arguments for many of their parameters. Optional. The default is true. See the User Manual's Dynamic requests section for more information.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "behind_chart",
          "type": "const bool",
          "description": "Optional. Controls whether all plots and drawings appear behind the chart display (if true) or in front of it (if false). This parameter only takes effect when the overlay parameter is true. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'strategy.cancel': {
    name: 'strategy.cancel',
    syntax: "strategy.cancel(id) → void",
    description: "Cancels a pending or unfilled order with a specific identifier. If multiple unfilled orders share the same ID, calling this command with that ID as the id argument cancels all of them. If a script calls this command with an id representing the ID of a filled order, it has no effect.",
    requiredParams: ["id"],
    optionalParams: [],
    signature: "strategy.cancel(id) → void",
    parameters: [
        {
          "name": "id",
          "type": "series string",
          "description": "The identifier of the unfilled order to cancel.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.cancel_all': {
    name: 'strategy.cancel_all',
    syntax: "strategy.cancel_all() → void",
    description: "Cancels all pending or unfilled orders, regardless of their identifiers.",
    requiredParams: [],
    optionalParams: [],
    signature: "strategy.cancel_all() → void",
    parameters: []
  },
  'strategy.close': {
    name: 'strategy.close',
    syntax: "strategy.close(id, comment, qty, qty_percent, alert_message, immediately, disable_alert) → void",
    description: "Creates an order to exit from the part of a position opened by entry orders with a specific identifier. If multiple entries in the position share the same ID, the orders from this command apply to all those entries, starting from the first open trade, when its calls use that ID as the id argument.",
    requiredParams: ["id"],
    optionalParams: ["comment","qty","qty_percent","alert_message","immediately","disable_alert"],
    signature: "strategy.close(id, comment, qty, qty_percent, alert_message, immediately, disable_alert) → void",
    parameters: [
        {
          "name": "id",
          "type": "series string",
          "description": "The entry identifier of the open trades to close.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "comment",
          "type": "series string",
          "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the automatically generated exit identifier. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "qty",
          "type": "series int/float",
          "description": "Optional. The number of contracts/lots/shares/units to close when an exit order fills. If specified, the command uses this value instead of qty_percent to determine the order size. The default is na, which means the order size depends on the qty_percent value.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "qty_percent",
          "type": "series int/float",
          "description": "Optional. A value between 0 and 100 representing the percentage of the open trade quantity to close when an exit order fills. The percentage calculation depends on the total size of the open trades with the id entry identifier. The command ignores this parameter if the qty value is not na. The default is 100.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "alert_message",
          "type": "series string",
          "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "immediately",
          "type": "series bool",
          "description": "Optional. If true, the closing order executes on the same tick when the strategy places it, ignoring the strategy properties that restrict execution to the opening tick of the following bar. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "disable_alert",
          "type": "series bool",
          "description": "Optional. If true when the command creates an order, the strategy does not trigger an alert when that order fills. This parameter accepts a \"series\" value, meaning users can control which orders trigger alerts when they execute. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'strategy.close_all': {
    name: 'strategy.close_all',
    syntax: "strategy.close_all(comment, alert_message, immediately, disable_alert) → void",
    description: "Creates an order to close an open position completely, regardless of the identifiers of the entry orders that opened or added to it.",
    requiredParams: [],
    optionalParams: ["comment","alert_message","immediately","disable_alert"],
    signature: "strategy.close_all(comment, alert_message, immediately, disable_alert) → void",
    parameters: [
        {
          "name": "comment",
          "type": "series string",
          "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the automatically generated exit identifier. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "alert_message",
          "type": "series string",
          "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "immediately",
          "type": "series bool",
          "description": "Optional. If true, the closing order executes on the same tick when the strategy places it, ignoring the strategy properties that restrict execution to the opening tick of the following bar. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "disable_alert",
          "type": "series bool",
          "description": "Optional. If true when the command creates an order, the strategy does not trigger an alert when that order fills. This parameter accepts a \"series\" value, meaning users can control which orders trigger alerts when they execute. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'strategy.closedtrades.commission': {
    name: 'strategy.closedtrades.commission',
    syntax: "strategy.closedtrades.commission(trade_num) → series float",
    description: "Returns the sum of entry and exit fees paid in the closed trade, expressed in strategy.account_currency.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.commission(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.entry_bar_index': {
    name: 'strategy.closedtrades.entry_bar_index',
    syntax: "strategy.closedtrades.entry_bar_index(trade_num) → series int",
    description: "Returns the bar_index of the closed trade's entry.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.entry_bar_index(trade_num) → series int",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.entry_comment': {
    name: 'strategy.closedtrades.entry_comment',
    syntax: "strategy.closedtrades.entry_comment(trade_num) → series string",
    description: "Returns the comment message of the closed trade's entry, or na if there is no entry with this trade_num.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.entry_comment(trade_num) → series string",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.entry_id': {
    name: 'strategy.closedtrades.entry_id',
    syntax: "strategy.closedtrades.entry_id(trade_num) → series string",
    description: "Returns the id of the closed trade's entry.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.entry_id(trade_num) → series string",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.entry_price': {
    name: 'strategy.closedtrades.entry_price',
    syntax: "strategy.closedtrades.entry_price(trade_num) → series float",
    description: "Returns the price of the closed trade's entry.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.entry_price(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.entry_time': {
    name: 'strategy.closedtrades.entry_time',
    syntax: "strategy.closedtrades.entry_time(trade_num) → series int",
    description: "Returns the UNIX time of the closed trade's entry, expressed in milliseconds..",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.entry_time(trade_num) → series int",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.exit_bar_index': {
    name: 'strategy.closedtrades.exit_bar_index',
    syntax: "strategy.closedtrades.exit_bar_index(trade_num) → series int",
    description: "Returns the bar_index of the closed trade's exit.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.exit_bar_index(trade_num) → series int",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.exit_comment': {
    name: 'strategy.closedtrades.exit_comment',
    syntax: "strategy.closedtrades.exit_comment(trade_num) → series string",
    description: "Returns the comment message of the closed trade's exit, or na if there is no entry with this trade_num.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.exit_comment(trade_num) → series string",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.exit_id': {
    name: 'strategy.closedtrades.exit_id',
    syntax: "strategy.closedtrades.exit_id(trade_num) → series string",
    description: "Returns the id of the closed trade's exit.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.exit_id(trade_num) → series string",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.exit_price': {
    name: 'strategy.closedtrades.exit_price',
    syntax: "strategy.closedtrades.exit_price(trade_num) → series float",
    description: "Returns the price of the closed trade's exit.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.exit_price(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.exit_time': {
    name: 'strategy.closedtrades.exit_time',
    syntax: "strategy.closedtrades.exit_time(trade_num) → series int",
    description: "Returns the UNIX time of the closed trade's exit, expressed in milliseconds.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.exit_time(trade_num) → series int",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.max_drawdown': {
    name: 'strategy.closedtrades.max_drawdown',
    syntax: "strategy.closedtrades.max_drawdown(trade_num) → series float",
    description: "Returns the maximum drawdown of the closed trade, i.e., the maximum possible loss during the trade, expressed in strategy.account_currency.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.max_drawdown(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.max_drawdown_percent': {
    name: 'strategy.closedtrades.max_drawdown_percent',
    syntax: "strategy.closedtrades.max_drawdown_percent(trade_num) → series float",
    description: "Returns the maximum drawdown of the closed trade, i.e., the maximum possible loss during the trade, expressed as a percentage and calculated by formula: Lowest Value During Trade / (Entry Price x Quantity) * 100.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.max_drawdown_percent(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.max_runup': {
    name: 'strategy.closedtrades.max_runup',
    syntax: "strategy.closedtrades.max_runup(trade_num) → series float",
    description: "Returns the maximum run up of the closed trade, i.e., the maximum possible profit during the trade, expressed in strategy.account_currency.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.max_runup(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.max_runup_percent': {
    name: 'strategy.closedtrades.max_runup_percent',
    syntax: "strategy.closedtrades.max_runup_percent(trade_num) → series float",
    description: "Returns the maximum run-up of the closed trade, i.e., the maximum possible profit during the trade, expressed as a percentage and calculated by formula: Highest Value During Trade / (Entry Price x Quantity) * 100.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.max_runup_percent(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.profit': {
    name: 'strategy.closedtrades.profit',
    syntax: "strategy.closedtrades.profit(trade_num) → series float",
    description: "Returns the profit/loss of the closed trade in the strategy's account currency, reduced by the trade's commissions. A positive returned value represents a profit, and a negative value represents a loss.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.profit(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.profit_percent': {
    name: 'strategy.closedtrades.profit_percent',
    syntax: "strategy.closedtrades.profit_percent(trade_num) → series float",
    description: "Returns the profit/loss value of the closed trade, expressed as a percentage. Losses are expressed as negative values.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.profit_percent(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.closedtrades.size': {
    name: 'strategy.closedtrades.size',
    syntax: "strategy.closedtrades.size(trade_num) → series float",
    description: "Returns the direction and the number of contracts traded in the closed trade. If the value is > 0, the market position was long. If the value is < 0, the market position was short.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.closedtrades.size(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.convert_to_account': {
    name: 'strategy.convert_to_account',
    syntax: "strategy.convert_to_account(value) → series float",
    description: "Converts the value from the currency that the symbol on the chart is traded in (syminfo.currency) to the currency used by the strategy (strategy.account_currency).",
    requiredParams: ["value"],
    optionalParams: [],
    signature: "strategy.convert_to_account(value) → series float",
    parameters: [
        {
          "name": "value",
          "type": "series int/float",
          "description": "The value to be converted.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.convert_to_symbol': {
    name: 'strategy.convert_to_symbol',
    syntax: "strategy.convert_to_symbol(value) → series float",
    description: "Converts the value from the currency used by the strategy (strategy.account_currency) to the currency that the symbol on the chart is traded in (syminfo.currency).",
    requiredParams: ["value"],
    optionalParams: [],
    signature: "strategy.convert_to_symbol(value) → series float",
    parameters: [
        {
          "name": "value",
          "type": "series int/float",
          "description": "The value to be converted.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.default_entry_qty': {
    name: 'strategy.default_entry_qty',
    syntax: "strategy.default_entry_qty(fill_price) → series float",
    description: "Calculates the default quantity, in units, of an entry order from strategy.entry or strategy.order if it were to fill at the specified fill_price value. The calculation depends on several strategy properties, including default_qty_type, default_qty_value, currency, and other parameters in the strategy function and their representation in the \"Properties\" tab of the strategy's settings.",
    requiredParams: ["fill_price"],
    optionalParams: [],
    signature: "strategy.default_entry_qty(fill_price) → series float",
    parameters: [
        {
          "name": "fill_price",
          "type": "series int/float",
          "description": "The fill price for which to calculate the default order quantity.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.entry': {
    name: 'strategy.entry',
    syntax: "strategy.entry(id, direction, qty, limit, stop, oca_name, oca_type, comment, alert_message, disable_alert) → void",
    description: "Creates a new order to open or add to a position. If an unfilled order with the same id exists, a call to this command modifies that order.",
    requiredParams: ["id"],
    optionalParams: ["direction","qty","limit","stop","oca_name","oca_type","comment","alert_message","disable_alert"],
    signature: "strategy.entry(id, direction, qty, limit, stop, oca_name, oca_type, comment, alert_message, disable_alert) → void",
    parameters: [
        {
          "name": "id",
          "type": "series string",
          "description": "The identifier of the order, which corresponds to an entry ID in the strategy's trades after the order fills. If the strategy opens a new position after filling the order, the order's ID becomes the strategy.position_entry_name value. Strategy commands can reference the order ID to cancel or modify pending orders and generate exit orders for specific open trades. The Strategy Tester and the chart display the order ID unless the command specifies a comment value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "direction",
          "type": "series strategy_direction",
          "description": "The direction of the trade. Possible values: strategy.long for a long trade, strategy.short for a short one.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "qty",
          "type": "series int/float",
          "description": "Optional. The number of contracts/shares/lots/units in the resulting open trade when the order fills. The default is na, which means that the command uses the default_qty_type and default_qty_value parameters of the strategy declaration statement to determine the quantity.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "limit",
          "type": "series int/float",
          "description": "Optional. The limit price of the order. If specified, the command creates a limit or stop-limit order, depending on whether the stop value is also specified. The default is na, which means the resulting order is not of the limit or stop-limit type.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "stop",
          "type": "series int/float",
          "description": "Optional. The stop price of the order. If specified, the command creates a stop or stop-limit order, depending on whether the limit value is also specified. The default is na, which means the resulting order is not of the stop or stop-limit type.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "oca_name",
          "type": "series string",
          "description": "Optional. The name of the order's One-Cancels-All (OCA) group. When a pending order with the same oca_name and oca_type parameters executes, that order affects all unfilled orders in the group. The default is an empty string, which means the order does not belong to an OCA group.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "oca_type",
          "type": "input string",
          "description": "Optional. Specifies how an unfilled order behaves when another pending order with the same oca_name and oca_type values executes. Possible values: strategy.oca.cancel, strategy.oca.reduce, strategy.oca.none. The default is strategy.oca.none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "comment",
          "type": "series string",
          "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "alert_message",
          "type": "series string",
          "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "disable_alert",
          "type": "series bool",
          "description": "Optional. If true when the command creates an order, the strategy does not trigger an alert when that order fills. This parameter accepts a \"series\" value, meaning users can control which orders trigger alerts when they execute. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'strategy.exit': {
    name: 'strategy.exit',
    syntax: "strategy.exit(id, from_entry, qty, qty_percent, profit, limit, loss, stop, trail_price, trail_points, trail_offset, oca_name, comment, comment_profit, comment_loss, comment_trailing, alert_message, alert_profit, alert_loss, alert_trailing, disable_alert) → void",
    description: "Creates price-based orders to exit from an open position. If unfilled exit orders with the same id exist, calls to this command modify those orders. This command can generate more than one type of exit order, depending on the specified parameters. However, it does not create market orders. To exit from a position with a market order, use strategy.close or strategy.close_all.",
    requiredParams: ["id"],
    optionalParams: ["from_entry","qty","qty_percent","profit","limit","loss","stop","trail_price","trail_points","trail_offset","oca_name","comment","comment_profit","comment_loss","comment_trailing","alert_message","alert_profit","alert_loss","alert_trailing","disable_alert"],
    signature: "strategy.exit(id, from_entry, qty, qty_percent, profit, limit, loss, stop, trail_price, trail_points, trail_offset, oca_name, comment, comment_profit, comment_loss, comment_trailing, alert_message, alert_profit, alert_loss, alert_trailing, disable_alert) → void",
    parameters: [
        {
          "name": "id",
          "type": "series string",
          "description": "The identifier of the orders, which corresponds to an exit ID in the strategy's trades after an order fills. Strategy commands can reference the order ID to cancel or modify pending exit orders. The Strategy Tester and the chart display the order ID unless the command includes a comment* argument that applies to the filled order.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "from_entry",
          "type": "series string",
          "description": "Optional. The entry order ID of the trade to exit from. If there is more than one open trade with the specified entry ID, the command generates exit orders for all the entries from before or at the time of the call. The default is an empty string, which means the command generates exit orders for all open trades until the position closes.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "qty",
          "type": "series int/float",
          "description": "Optional. The number of contracts/lots/shares/units to close when an exit order fills. If specified, the command uses this value instead of qty_percent to determine the order size. The exit orders reserve this quantity from the position, meaning other calls to this command cannot close this portion until the strategy fills or cancels those orders. The default is na, which means the order size depends on the qty_percent value.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "qty_percent",
          "type": "series int/float",
          "description": "Optional. A value between 0 and 100 representing the percentage of the open trade quantity to close when an exit order fills. The exit orders reserve this percentage from the applicable open trades, meaning other calls to this command cannot close this portion until the strategy fills or cancels those orders. The percentage calculation depends on the total size of the applicable open trades without considering the reserved amount from other strategy.exit calls. The command ignores this parameter if the qty value is not na. The default is 100.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "profit",
          "type": "series int/float",
          "description": "Optional. The take-profit distance, expressed in ticks. If specified, the command creates a limit order to exit the trade profit ticks away from the entry price in the favorable direction. The order executes at the calculated price or a better value. If this parameter and limit are not na, the command places a take-profit order only at the price level expected to trigger an exit first. The default is na.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "limit",
          "type": "series int/float",
          "description": "Optional. The take-profit price. If this parameter and profit are not na, the command places a take-profit order only at the price level expected to trigger an exit first. The default is na.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "loss",
          "type": "series int/float",
          "description": "Optional. The stop-loss distance, expressed in ticks. If specified, the command creates a stop order to exit the trade loss ticks away from the entry price in the unfavorable direction. The order executes at the calculated price or a worse value. If this parameter and stop are not na, the command places a stop-loss order only at the price level expected to trigger an exit first. The default is na.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "stop",
          "type": "series int/float",
          "description": "Optional. The stop-loss price. If this parameter and loss are not na, the command places a stop-loss order only at the price level expected to trigger an exit first. The default is na.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "trail_price",
          "type": "series int/float",
          "description": "Optional. The price of the trailing stop activation level. If the value is more favorable than the entry price, the command creates a trailing stop when the market price reaches that value. If less favorable than the entry price, the command creates the trailing stop immediately when the current market price is equal to or more favorable than the value. If this parameter and trail_points are not na, the command sets the activation level using the value expected to activate the stop first. The default is na.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "trail_points",
          "type": "series int/float",
          "description": "Optional. The trailing stop activation distance, expressed in ticks. If the value is positive, the command creates a trailing stop order when the market price moves trail_points ticks away from the trade's entry price in the favorable direction. If the value is negative, the command creates the trailing stop immediately when the market price is equal to or more favorable than the level trail_points ticks away from the entry price in the unfavorable direction. The default is na.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "trail_offset",
          "type": "series int/float",
          "description": "Optional. The trailing stop offset. When the market price reaches the activation level determined by the trail_price or trail_points parameter, or exceeds the level in the favorable direction, the command creates a trailing stop with an initial value trail_offset ticks away from that level in the unfavorable direction. After activation, the trailing stop moves toward the market price each time the trade's profit reaches a better value, maintaining the specified distance behind the best price. The default is na.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "oca_name",
          "type": "series string",
          "description": "Optional. The name of the One-Cancels-All (OCA) group that the command's take-profit, stop-loss, and trailing stop orders belong to. All orders from this command are of the strategy.oca.reduce OCA type. When an order of this OCA type with the same oca_name executes, the strategy reduces the sizes of other unfilled orders in the OCA group by the filled quantity. The default is an empty string, which means the strategy assigns the OCA name automatically, and the resulting orders cannot reduce or be reduced by the orders from other commands.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "comment",
          "type": "series string",
          "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id. The command ignores this value if the call includes an argument for a comment_* parameter that applies to the order. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "comment_profit",
          "type": "series string",
          "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id or comment. This comment applies only to the command's take-profit orders created using the profit or limit parameter. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "comment_loss",
          "type": "series string",
          "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id or comment. This comment applies only to the command's stop-loss orders created using the loss or stop parameter. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "comment_trailing",
          "type": "series string",
          "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id or comment. This comment applies only to the command's trailing stop orders created using the trail_price or trail_points and trail_offset parameters. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "alert_message",
          "type": "series string",
          "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. The command ignores this value if the call includes an argument for the other alert_* parameter that applies to the order. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "alert_profit",
          "type": "series string",
          "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. This message applies only to the command's take-profit orders created using the profit or limit parameter. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "alert_loss",
          "type": "series string",
          "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. This message applies only to the command's stop-loss orders created using the loss or stop parameter. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "alert_trailing",
          "type": "series string",
          "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. This message applies only to the command's trailing stop orders created using the trail_price or trail_points and trail_offset parameters. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "disable_alert",
          "type": "series bool",
          "description": "Optional. If true when the command creates an order, the strategy does not trigger an alert when that order fills. This parameter accepts a \"series\" value, meaning users can control which orders trigger alerts when they execute. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'strategy.opentrades.commission': {
    name: 'strategy.opentrades.commission',
    syntax: "strategy.opentrades.commission(trade_num) → series float",
    description: "Returns the sum of entry and exit fees paid in the open trade, expressed in strategy.account_currency.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.commission(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the open trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.entry_bar_index': {
    name: 'strategy.opentrades.entry_bar_index',
    syntax: "strategy.opentrades.entry_bar_index(trade_num) → series int",
    description: "Returns the bar_index of the open trade's entry.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.entry_bar_index(trade_num) → series int",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the open trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.entry_comment': {
    name: 'strategy.opentrades.entry_comment',
    syntax: "strategy.opentrades.entry_comment(trade_num) → series string",
    description: "Returns the comment message of the open trade's entry, or na if there is no entry with this trade_num.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.entry_comment(trade_num) → series string",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the open trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.entry_id': {
    name: 'strategy.opentrades.entry_id',
    syntax: "strategy.opentrades.entry_id(trade_num) → series string",
    description: "Returns the id of the open trade's entry.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.entry_id(trade_num) → series string",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the open trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.entry_price': {
    name: 'strategy.opentrades.entry_price',
    syntax: "strategy.opentrades.entry_price(trade_num) → series float",
    description: "Returns the price of the open trade's entry.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.entry_price(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the open trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.entry_time': {
    name: 'strategy.opentrades.entry_time',
    syntax: "strategy.opentrades.entry_time(trade_num) → series int",
    description: "Returns the UNIX time of the open trade's entry, expressed in milliseconds.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.entry_time(trade_num) → series int",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the open trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.max_drawdown': {
    name: 'strategy.opentrades.max_drawdown',
    syntax: "strategy.opentrades.max_drawdown(trade_num) → series float",
    description: "Returns the maximum drawdown of the open trade, i.e., the maximum possible loss during the trade, expressed in strategy.account_currency.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.max_drawdown(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the open trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.max_drawdown_percent': {
    name: 'strategy.opentrades.max_drawdown_percent',
    syntax: "strategy.opentrades.max_drawdown_percent(trade_num) → series float",
    description: "Returns the maximum drawdown of the open trade, i.e., the maximum possible loss during the trade, expressed as a percentage and calculated by formula: Lowest Value During Trade / (Entry Price x Quantity) * 100.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.max_drawdown_percent(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.max_runup': {
    name: 'strategy.opentrades.max_runup',
    syntax: "strategy.opentrades.max_runup(trade_num) → series float",
    description: "Returns the maximum run up of the open trade, i.e., the maximum possible profit during the trade, expressed in strategy.account_currency.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.max_runup(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the open trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.max_runup_percent': {
    name: 'strategy.opentrades.max_runup_percent',
    syntax: "strategy.opentrades.max_runup_percent(trade_num) → series float",
    description: "Returns the maximum run-up of the open trade, i.e., the maximum possible profit during the trade, expressed as a percentage and calculated by formula: Highest Value During Trade / (Entry Price x Quantity) * 100.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.max_runup_percent(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.profit': {
    name: 'strategy.opentrades.profit',
    syntax: "strategy.opentrades.profit(trade_num) → series float",
    description: "Returns the profit/loss of the open trade, expressed in strategy.account_currency. Losses are expressed as negative values.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.profit(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the open trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.profit_percent': {
    name: 'strategy.opentrades.profit_percent',
    syntax: "strategy.opentrades.profit_percent(trade_num) → series float",
    description: "Returns the profit/loss of the open trade, expressed as a percentage. Losses are expressed as negative values.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.profit_percent(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the closed trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.opentrades.size': {
    name: 'strategy.opentrades.size',
    syntax: "strategy.opentrades.size(trade_num) → series float",
    description: "Returns the direction and the number of contracts traded in the open trade. If the value is > 0, the market position was long. If the value is < 0, the market position was short.",
    requiredParams: ["trade_num"],
    optionalParams: [],
    signature: "strategy.opentrades.size(trade_num) → series float",
    parameters: [
        {
          "name": "trade_num",
          "type": "series int",
          "description": "The trade number of the open trade. The number of the first trade is zero.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.order': {
    name: 'strategy.order',
    syntax: "strategy.order(id, direction, qty, limit, stop, oca_name, oca_type, comment, alert_message, disable_alert) → void",
    description: "Creates a new order to open, add to, or exit from a position. If an unfilled order with the same id exists, a call to this command modifies that order.",
    requiredParams: ["id"],
    optionalParams: ["direction","qty","limit","stop","oca_name","oca_type","comment","alert_message","disable_alert"],
    signature: "strategy.order(id, direction, qty, limit, stop, oca_name, oca_type, comment, alert_message, disable_alert) → void",
    parameters: [
        {
          "name": "id",
          "type": "series string",
          "description": "The identifier of the order, which corresponds to an entry or exit ID in the strategy's trades after the order fills. If the strategy opens a new position after filling the order, the order's ID becomes the strategy.position_entry_name value. Strategy commands can reference the order ID to cancel or modify pending orders and generate exit orders for specific open trades. The Strategy Tester and the chart display the order ID unless the command specifies a comment value.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "direction",
          "type": "series strategy_direction",
          "description": "The direction of the trade. Possible values: strategy.long for a long trade, strategy.short for a short one.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "qty",
          "type": "series int/float",
          "description": "Optional. The number of contracts/shares/lots/units to trade when the order fills. The default is na, which means that the command uses the default_qty_type and default_qty_value parameters of the strategy declaration statement to determine the quantity.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "limit",
          "type": "series int/float",
          "description": "Optional. The limit price of the order. If specified, the command creates a limit or stop-limit order, depending on whether the stop value is also specified. The default is na, which means the resulting order is not of the limit or stop-limit type.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "stop",
          "type": "series int/float",
          "description": "Optional. The stop price of the order. If specified, the command creates a stop or stop-limit order, depending on whether the limit value is also specified. The default is na, which means the resulting order is not of the stop or stop-limit type.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "oca_name",
          "type": "series string",
          "description": "Optional. The name of the order's One-Cancels-All (OCA) group. When a pending order with the same oca_name and oca_type parameters executes, that order affects all unfilled orders in the group. The default is an empty string, which means the order does not belong to an OCA group.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "oca_type",
          "type": "input string",
          "description": "Optional. Specifies how an unfilled order behaves when another pending order with the same oca_name and oca_type values executes. Possible values: strategy.oca.cancel, strategy.oca.reduce, strategy.oca.none. The default is strategy.oca.none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "comment",
          "type": "series string",
          "description": "Optional. Additional notes on the filled order. If the value is not an empty string, the Strategy Tester and the chart show this text for the order instead of the specified id. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "alert_message",
          "type": "series string",
          "description": "Optional. Custom text for the alert that fires when an order fills. If the \"Message\" field of the \"Create Alert\" dialog box contains the {{strategy.order.alert_message}} placeholder, the alert message replaces the placeholder with this text. The default is an empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "disable_alert",
          "type": "series bool",
          "description": "Optional. If true when the command creates an order, the strategy does not trigger an alert when that order fills. This parameter accepts a \"series\" value, meaning users can control which orders trigger alerts when they execute. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'strategy.risk.allow_entry_in': {
    name: 'strategy.risk.allow_entry_in',
    syntax: "strategy.risk.allow_entry_in(value) → void",
    description: "This function can be used to specify in which market direction the strategy.entry function is allowed to open positions.",
    requiredParams: ["value"],
    optionalParams: [],
    signature: "strategy.risk.allow_entry_in(value) → void",
    parameters: [
        {
          "name": "value",
          "type": "simple string",
          "description": "The allowed direction. Possible values: strategy.direction.all, strategy.direction.long, strategy.direction.short",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'strategy.risk.max_cons_loss_days': {
    name: 'strategy.risk.max_cons_loss_days',
    syntax: "strategy.risk.max_cons_loss_days(count, alert_message) → void",
    description: "The purpose of this rule is to cancel all pending orders, close all open positions and stop placing orders after a specified number of consecutive days with losses. The rule affects the whole strategy.",
    requiredParams: ["count"],
    optionalParams: ["alert_message"],
    signature: "strategy.risk.max_cons_loss_days(count, alert_message) → void",
    parameters: [
        {
          "name": "count",
          "type": "simple int",
          "description": "A required parameter. The allowed number of consecutive days with losses.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "alert_message",
          "type": "simple string",
          "description": "An optional parameter which replaces the {{strategy.order.alert_message}} placeholder when it is used in the \"Create Alert\" dialog box's \"Message\" field.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'strategy.risk.max_drawdown': {
    name: 'strategy.risk.max_drawdown',
    syntax: "strategy.risk.max_drawdown(value, type, alert_message) → void",
    description: "The purpose of this rule is to determine maximum drawdown. The rule affects the whole strategy. Once the maximum drawdown value is reached, all pending orders are cancelled, all open positions are closed and no new orders can be placed.",
    requiredParams: ["value","type"],
    optionalParams: ["alert_message"],
    signature: "strategy.risk.max_drawdown(value, type, alert_message) → void",
    parameters: [
        {
          "name": "value",
          "type": "simple int/float",
          "description": "A required parameter. The maximum drawdown value. It is specified either in money (base currency), or in percentage of maximum equity. For % of equity the range of allowed values is from 0 to 100.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "type",
          "type": "simple string",
          "description": "A required parameter. The type of the value. Please specify one of the following values: strategy.percent_of_equity or strategy.cash. Note: if equity drops down to zero or to a negative and the 'strategy.percent_of_equity' is specified, all pending orders are cancelled, all open positions are closed and no new orders can be placed for good.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "alert_message",
          "type": "simple string",
          "description": "An optional parameter which replaces the {{strategy.order.alert_message}} placeholder when it is used in the \"Create Alert\" dialog box's \"Message\" field.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'strategy.risk.max_intraday_filled_orders': {
    name: 'strategy.risk.max_intraday_filled_orders',
    syntax: "strategy.risk.max_intraday_filled_orders(count, alert_message) → void",
    description: "The purpose of this rule is to determine maximum number of filled orders per 1 day (per 1 bar, if chart resolution is higher than 1 day). The rule affects the whole strategy. Once the maximum number of filled orders is reached, all pending orders are cancelled, all open positions are closed and no new orders can be placed till the end of the current trading session.",
    requiredParams: ["count"],
    optionalParams: ["alert_message"],
    signature: "strategy.risk.max_intraday_filled_orders(count, alert_message) → void",
    parameters: [
        {
          "name": "count",
          "type": "simple int",
          "description": "A required parameter. The maximum number of filled orders per 1 day.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "alert_message",
          "type": "simple string",
          "description": "An optional parameter which replaces the {{strategy.order.alert_message}} placeholder when it is used in the \"Create Alert\" dialog box's \"Message\" field.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'strategy.risk.max_intraday_loss': {
    name: 'strategy.risk.max_intraday_loss',
    syntax: "strategy.risk.max_intraday_loss(value, type, alert_message) → void",
    description: "The maximum loss value allowed during a day. It is specified either in money (base currency), or in percentage of maximum intraday equity (0 -100).",
    requiredParams: ["value","type"],
    optionalParams: ["alert_message"],
    signature: "strategy.risk.max_intraday_loss(value, type, alert_message) → void",
    parameters: [
        {
          "name": "value",
          "type": "simple int/float",
          "description": "A required parameter. The maximum loss value. It is specified either in money (base currency), or in percentage of maximum intraday equity. For % of equity the range of allowed values is from 0 to 100.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "type",
          "type": "simple string",
          "description": "A required parameter. The type of the value. Please specify one of the following values: strategy.percent_of_equity or strategy.cash. Note: if equity drops down to zero or to a negative and the strategy.percent_of_equity is specified, all pending orders are cancelled, all open positions are closed and no new orders can be placed for good.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        },
        {
          "name": "alert_message",
          "type": "simple string",
          "description": "An optional parameter which replaces the {{strategy.order.alert_message}} placeholder when it is used in the \"Create Alert\" dialog box's \"Message\" field.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'strategy.risk.max_position_size': {
    name: 'strategy.risk.max_position_size',
    syntax: "strategy.risk.max_position_size(contracts) → void",
    description: "The purpose of this rule is to determine maximum size of a market position. The rule affects the following function: strategy.entry. The 'entry' quantity can be reduced (if needed) to such number of contracts/shares/lots/units, so the total position size doesn't exceed the value specified in 'strategy.risk.max_position_size'. If minimum possible quantity still violates the rule, the order will not be placed.",
    requiredParams: ["contracts"],
    optionalParams: [],
    signature: "strategy.risk.max_position_size(contracts) → void",
    parameters: [
        {
          "name": "contracts",
          "type": "simple int/float",
          "description": "A required parameter. Maximum number of contracts/shares/lots/units in a position.",
          "explicitlyOptional": false,
          "explicitlyRequired": true,
          "optional": false,
          "required": true
        }
      ]
  },
  'string': {
    name: 'string',
    syntax: "string(x) → const string",
    description: "Casts na to string",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "string(x) → const string",
    parameters: [
        {
          "name": "x",
          "type": "const string",
          "description": "The value to convert to the specified type, usually na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'syminfo.prefix': {
    name: 'syminfo.prefix',
    syntax: "syminfo.prefix(symbol) → simple string",
    description: "Returns exchange prefix of the symbol, e.g. \"NASDAQ\".",
    requiredParams: ["symbol"],
    optionalParams: [],
    signature: "syminfo.prefix(symbol) → simple string",
    parameters: [
        {
          "name": "symbol",
          "type": "simple string",
          "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\".",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'syminfo.ticker': {
    name: 'syminfo.ticker',
    syntax: "syminfo.ticker(symbol) → simple string",
    description: "Returns symbol name without exchange prefix, e.g. \"AAPL\".",
    requiredParams: ["symbol"],
    optionalParams: [],
    signature: "syminfo.ticker(symbol) → simple string",
    parameters: [
        {
          "name": "symbol",
          "type": "simple string",
          "description": "Symbol. Note that the symbol should be passed with a prefix. For example: \"NASDAQ:AAPL\" instead of \"AAPL\".",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'ta.alma': {
    name: 'ta.alma',
    syntax: "ta.alma(series, length, offset, sigma, floor) → series float",
    description: "Arnaud Legoux Moving Average. It uses Gaussian distribution as weights for moving average.",
    requiredParams: ["series"],
    optionalParams: ["length","offset","sigma","floor"],
    signature: "ta.alma(series, length, offset, sigma, floor) → series float",
    parameters: [
        {
          "name": "series",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "offset",
          "type": "simple int/float",
          "description": "Controls tradeoff between smoothness (closer to 1) and responsiveness (closer to 0).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "sigma",
          "type": "simple int/float",
          "description": "Changes the smoothness of ALMA. The larger sigma the smoother ALMA.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "floor",
          "type": "simple bool",
          "description": "An optional parameter. Specifies whether the offset calculation is floored before ALMA is calculated. Default value is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ta.atr': {
    name: 'ta.atr',
    syntax: "ta.atr(length) → series float",
    description: "Function atr (average true range) returns the RMA of true range. True range is max(high - low, abs(high - close[1]), abs(low - close[1])).",
    requiredParams: ["length"],
    optionalParams: [],
    signature: "ta.atr(length) → series float",
    parameters: [
        {
          "name": "length",
          "type": "simple int",
          "description": "Length (number of bars back).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'ta.barssince': {
    name: 'ta.barssince',
    syntax: "ta.barssince(condition) → series int",
    description: "Counts the number of bars since the last time the condition was true.",
    requiredParams: ["condition"],
    optionalParams: [],
    signature: "ta.barssince(condition) → series int",
    parameters: [
        {
          "name": "condition",
          "type": "series bool",
          "description": "The condition to check for.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'ta.bb': {
    name: 'ta.bb',
    syntax: "ta.bb(series, length, mult) → [series float, series float, series float]",
    description: "Bollinger Bands. A Bollinger Band is a technical analysis tool defined by a set of lines plotted two standard deviations (positively and negatively) away from a simple moving average (SMA) of the security's price, but can be adjusted to user preferences.",
    requiredParams: ["series"],
    optionalParams: ["length","mult"],
    signature: "ta.bb(series, length, mult) → [series float, series float, series float]",
    parameters: [
        {
          "name": "series",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "mult",
          "type": "simple int/float",
          "description": "Standard deviation factor.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.bbw': {
    name: 'ta.bbw',
    syntax: "ta.bbw(series, length, mult) → series float",
    description: "Bollinger Bands Width. The Bollinger Band Width is the difference between the upper and the lower Bollinger Bands divided by the middle band.",
    requiredParams: ["series"],
    optionalParams: ["length","mult"],
    signature: "ta.bbw(series, length, mult) → series float",
    parameters: [
        {
          "name": "series",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "mult",
          "type": "simple int/float",
          "description": "Standard deviation factor.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.cci': {
    name: 'ta.cci',
    syntax: "ta.cci(source, length) → series float",
    description: "The CCI (commodity channel index) is calculated as the difference between the typical price of a commodity and its simple moving average, divided by the mean absolute deviation of the typical price. The index is scaled by an inverse factor of 0.015 to provide more readable numbers.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.cci(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.change': {
    name: 'ta.change',
    syntax: "ta.change(source, length) → series int",
    description: "Compares the current source value to its value length bars ago and returns the difference.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.change(source, length) → series int",
    parameters: [
        {
          "name": "source",
          "type": "series int",
          "description": "Source series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "How far the past source value is offset from the current one, in bars. Optional. The default is 1.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ta.cmo': {
    name: 'ta.cmo',
    syntax: "ta.cmo(series, length) → series float",
    description: "Chande Momentum Oscillator. Calculates the difference between the sum of recent gains and the sum of recent losses and then divides the result by the sum of all price movement over the same period.",
    requiredParams: ["series"],
    optionalParams: ["length"],
    signature: "ta.cmo(series, length) → series float",
    parameters: [
        {
          "name": "series",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.cog': {
    name: 'ta.cog',
    syntax: "ta.cog(source, length) → series float",
    description: "The cog (center of gravity) is an indicator based on statistics and the Fibonacci golden ratio.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.cog(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.correlation': {
    name: 'ta.correlation',
    syntax: "ta.correlation(source1, source2, length) → series float",
    description: "Correlation coefficient. Describes the degree to which two series tend to deviate from their ta.sma values.",
    requiredParams: ["source1"],
    optionalParams: ["source2","length"],
    signature: "ta.correlation(source1, source2, length) → series float",
    parameters: [
        {
          "name": "source1",
          "type": "series int/float",
          "description": "Source series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "source2",
          "type": "series int/float",
          "description": "Target series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Length (number of bars back).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.cross': {
    name: 'ta.cross',
    syntax: "ta.cross(source1, source2) → series bool",
    description: "source1 (series int/float) First data series.",
    requiredParams: ["source1"],
    optionalParams: ["source2"],
    signature: "ta.cross(source1, source2) → series bool",
    parameters: [
        {
          "name": "source1",
          "type": "series int/float",
          "description": "First data series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "source2",
          "type": "series int/float",
          "description": "Second data series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.crossover': {
    name: 'ta.crossover',
    syntax: "ta.crossover(source1, source2) → series bool",
    description: "The source1-series is defined as having crossed over source2-series if, on the current bar, the value of source1 is greater than the value of source2, and on the previous bar, the value of source1 was less than or equal to the value of source2.",
    requiredParams: ["source1"],
    optionalParams: ["source2"],
    signature: "ta.crossover(source1, source2) → series bool",
    parameters: [
        {
          "name": "source1",
          "type": "series int/float",
          "description": "First data series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "source2",
          "type": "series int/float",
          "description": "Second data series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.crossunder': {
    name: 'ta.crossunder',
    syntax: "ta.crossunder(source1, source2) → series bool",
    description: "The source1-series is defined as having crossed under source2-series if, on the current bar, the value of source1 is less than the value of source2, and on the previous bar, the value of source1 was greater than or equal to the value of source2.",
    requiredParams: ["source1"],
    optionalParams: ["source2"],
    signature: "ta.crossunder(source1, source2) → series bool",
    parameters: [
        {
          "name": "source1",
          "type": "series int/float",
          "description": "First data series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "source2",
          "type": "series int/float",
          "description": "Second data series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.cum': {
    name: 'ta.cum',
    syntax: "ta.cum(source) → series float",
    description: "Cumulative (total) sum of source. In other words it's a sum of all elements of source.",
    requiredParams: ["source"],
    optionalParams: [],
    signature: "ta.cum(source) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Source used for the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'ta.dev': {
    name: 'ta.dev',
    syntax: "ta.dev(source, length) → series float",
    description: "Measure of difference between the series and it's ta.sma",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.dev(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.dmi': {
    name: 'ta.dmi',
    syntax: "ta.dmi(diLength, adxSmoothing) → [series float, series float, series float]",
    description: "The dmi function returns the directional movement index.",
    requiredParams: ["diLength"],
    optionalParams: ["adxSmoothing"],
    signature: "ta.dmi(diLength, adxSmoothing) → [series float, series float, series float]",
    parameters: [
        {
          "name": "diLength",
          "type": "simple int",
          "description": "DI Period.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "adxSmoothing",
          "type": "simple int",
          "description": "ADX Smoothing Period.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.ema': {
    name: 'ta.ema',
    syntax: "ta.ema(source, length) → series float",
    description: "The ema function returns the exponentially weighted moving average. In ema weighting factors decrease exponentially. It calculates by using a formula: EMA = alpha * source + (1 - alpha) * EMA[1], where alpha = 2 / (length + 1).",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.ema(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "simple int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.falling': {
    name: 'ta.falling',
    syntax: "ta.falling(source, length) → series bool",
    description: "Test if the source series is now falling for length bars long.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.falling(source, length) → series bool",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.highest': {
    name: 'ta.highest',
    syntax: "ta.highest(source, length) → series float",
    description: "Highest value for a given number of bars back.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.highest(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.highestbars': {
    name: 'ta.highestbars',
    syntax: "ta.highestbars(source, length) → series int",
    description: "Highest value offset for a given number of bars back.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.highestbars(source, length) → series int",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.hma': {
    name: 'ta.hma',
    syntax: "ta.hma(source, length) → series float",
    description: "The hma function returns the Hull Moving Average.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.hma(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "simple int",
          "description": "Number of bars.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.kc': {
    name: 'ta.kc',
    syntax: "ta.kc(series, length, mult, useTrueRange) → [series float, series float, series float]",
    description: "Keltner Channels. Keltner channel is a technical analysis indicator showing a central moving average line plus channel lines at a distance above and below.",
    requiredParams: ["series"],
    optionalParams: ["length","mult","useTrueRange"],
    signature: "ta.kc(series, length, mult, useTrueRange) → [series float, series float, series float]",
    parameters: [
        {
          "name": "series",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "simple int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "mult",
          "type": "simple int/float",
          "description": "Standard deviation factor.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "useTrueRange",
          "type": "simple bool",
          "description": "An optional parameter. Specifies if True Range is used; default is true. If the value is false, the range will be calculated with the expression (high - low).",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ta.kcw': {
    name: 'ta.kcw',
    syntax: "ta.kcw(series, length, mult, useTrueRange) → series float",
    description: "Keltner Channels Width. The Keltner Channels Width is the difference between the upper and the lower Keltner Channels divided by the middle channel.",
    requiredParams: ["series"],
    optionalParams: ["length","mult","useTrueRange"],
    signature: "ta.kcw(series, length, mult, useTrueRange) → series float",
    parameters: [
        {
          "name": "series",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "simple int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "mult",
          "type": "simple int/float",
          "description": "Standard deviation factor.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "useTrueRange",
          "type": "simple bool",
          "description": "An optional parameter. Specifies if True Range is used; default is true. If the value is false, the range will be calculated with the expression (high - low).",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ta.linreg': {
    name: 'ta.linreg',
    syntax: "ta.linreg(source, length, offset) → series float",
    description: "Linear regression curve. A line that best fits the prices specified over a user-defined time period. It is calculated using the least squares method. The result of this function is calculated using the formula: linreg = intercept + slope * (length - 1 - offset), where intercept and slope are the values calculated with the least squares method on source series.",
    requiredParams: ["source"],
    optionalParams: ["length","offset"],
    signature: "ta.linreg(source, length, offset) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Source series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "offset",
          "type": "simple int",
          "description": "Offset.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.lowest': {
    name: 'ta.lowest',
    syntax: "ta.lowest(source, length) → series float",
    description: "Lowest value for a given number of bars back.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.lowest(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.lowestbars': {
    name: 'ta.lowestbars',
    syntax: "ta.lowestbars(source, length) → series int",
    description: "Lowest value offset for a given number of bars back.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.lowestbars(source, length) → series int",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars back.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.macd': {
    name: 'ta.macd',
    syntax: "ta.macd(source, fastlen, slowlen, siglen) → [series float, series float, series float]",
    description: "MACD (moving average convergence/divergence). It is supposed to reveal changes in the strength, direction, momentum, and duration of a trend in a stock's price.",
    requiredParams: ["source"],
    optionalParams: ["fastlen","slowlen","siglen"],
    signature: "ta.macd(source, fastlen, slowlen, siglen) → [series float, series float, series float]",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "fastlen",
          "type": "simple int",
          "description": "Fast Length parameter.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "slowlen",
          "type": "simple int",
          "description": "Slow Length parameter.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "siglen",
          "type": "simple int",
          "description": "Signal Length parameter.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.max': {
    name: 'ta.max',
    syntax: "ta.max(source) → series float",
    description: "Returns the all-time high value of source from the beginning of the chart up to the current bar.",
    requiredParams: ["source"],
    optionalParams: [],
    signature: "ta.max(source) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Source used for the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'ta.median': {
    name: 'ta.median',
    syntax: "ta.median(source, length) → series int",
    description: "Returns the median of the series.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.median(source, length) → series int",
    parameters: [
        {
          "name": "source",
          "type": "series int",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.mfi': {
    name: 'ta.mfi',
    syntax: "ta.mfi(series, length) → series float",
    description: "Money Flow Index. The Money Flow Index (MFI) is a technical oscillator that uses price and volume for identifying overbought or oversold conditions in an asset.",
    requiredParams: ["series"],
    optionalParams: ["length"],
    signature: "ta.mfi(series, length) → series float",
    parameters: [
        {
          "name": "series",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.min': {
    name: 'ta.min',
    syntax: "ta.min(source) → series float",
    description: "Returns the all-time low value of source from the beginning of the chart up to the current bar.",
    requiredParams: ["source"],
    optionalParams: [],
    signature: "ta.min(source) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Source used for the calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'ta.mode': {
    name: 'ta.mode',
    syntax: "ta.mode(source, length) → series int",
    description: "Returns the mode of the series. If there are several values with the same frequency, it returns the smallest value.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.mode(source, length) → series int",
    parameters: [
        {
          "name": "source",
          "type": "series int",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.mom': {
    name: 'ta.mom',
    syntax: "ta.mom(source, length) → series float",
    description: "Momentum of source price and source price length bars ago. This is simply a difference: source - source[length].",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.mom(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Offset from the current bar to the previous bar.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.percentile_linear_interpolation': {
    name: 'ta.percentile_linear_interpolation',
    syntax: "ta.percentile_linear_interpolation(source, length, percentage) → series float",
    description: "Calculates percentile using method of linear interpolation between the two nearest ranks.",
    requiredParams: ["source"],
    optionalParams: ["length","percentage"],
    signature: "ta.percentile_linear_interpolation(source, length, percentage) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process (source).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars back (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "percentage",
          "type": "simple int/float",
          "description": "Percentage, a number from range 0..100.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.percentile_nearest_rank': {
    name: 'ta.percentile_nearest_rank',
    syntax: "ta.percentile_nearest_rank(source, length, percentage) → series float",
    description: "Calculates percentile using method of Nearest Rank.",
    requiredParams: ["source"],
    optionalParams: ["length","percentage"],
    signature: "ta.percentile_nearest_rank(source, length, percentage) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process (source).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars back (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "percentage",
          "type": "simple int/float",
          "description": "Percentage, a number from range 0..100.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.percentrank': {
    name: 'ta.percentrank',
    syntax: "ta.percentrank(source, length) → series float",
    description: "Percent rank is the percents of how many previous values was less than or equal to the current value of given series.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.percentrank(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.pivot_point_levels': {
    name: 'ta.pivot_point_levels',
    syntax: "ta.pivot_point_levels(type, anchor, developing) → array<float>",
    description: "Calculates the pivot point levels using the specified type and anchor.",
    requiredParams: ["type"],
    optionalParams: ["anchor","developing"],
    signature: "ta.pivot_point_levels(type, anchor, developing) → array<float>",
    parameters: [
        {
          "name": "type",
          "type": "series string",
          "description": "The type of pivot point levels. Possible values: \"Traditional\", \"Fibonacci\", \"Woodie\", \"Classic\", \"DM\", \"Camarilla\".",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "anchor",
          "type": "series bool",
          "description": "The condition that triggers the reset of the pivot point calculations. When true, calculations reset; when false, results calculated at the last reset persist.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "developing",
          "type": "series bool",
          "description": "If false, the values are those calculated the last time the anchor condition was true. They remain constant until the anchor condition becomes true again. If true, the pivots are developing, i.e., they constantly recalculate on the data developing between the point of the last anchor (or bar zero if the anchor condition was never true) and the current bar. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ta.pivothigh': {
    name: 'ta.pivothigh',
    syntax: "ta.pivothigh(leftbars, rightbars) → series float",
    description: "This function returns price of the pivot high point. It returns 'NaN', if there was no pivot high point.",
    requiredParams: ["leftbars"],
    optionalParams: ["rightbars"],
    signature: "ta.pivothigh(leftbars, rightbars) → series float",
    parameters: [
        {
          "name": "leftbars",
          "type": "series int/float",
          "description": "Left strength.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "rightbars",
          "type": "series int/float",
          "description": "Right strength.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.pivotlow': {
    name: 'ta.pivotlow',
    syntax: "ta.pivotlow(leftbars, rightbars) → series float",
    description: "This function returns price of the pivot low point. It returns 'NaN', if there was no pivot low point.",
    requiredParams: ["leftbars"],
    optionalParams: ["rightbars"],
    signature: "ta.pivotlow(leftbars, rightbars) → series float",
    parameters: [
        {
          "name": "leftbars",
          "type": "series int/float",
          "description": "Left strength.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "rightbars",
          "type": "series int/float",
          "description": "Right strength.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.range': {
    name: 'ta.range',
    syntax: "ta.range(source, length) → series int",
    description: "Returns the difference between the min and max values in a series.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.range(source, length) → series int",
    parameters: [
        {
          "name": "source",
          "type": "series int",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.rci': {
    name: 'ta.rci',
    syntax: "ta.rci(source, length) → series float",
    description: "Calculates the Rank Correlation Index (RCI), which measures the directional consistency of price movements. It evaluates the monotonic relationship between a source series and the bar index over length bars using Spearman's rank correlation coefficient. The resulting value is scaled to a range of -100 to 100, where 100 indicates the source consistently increased over the period, and -100 indicates it consistently decreased. Values between -100 and 100 reflect varying degrees of upward or downward consistency.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.rci(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "simple int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.rising': {
    name: 'ta.rising',
    syntax: "ta.rising(source, length) → series bool",
    description: "Test if the source series is now rising for length bars long.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.rising(source, length) → series bool",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.rma': {
    name: 'ta.rma',
    syntax: "ta.rma(source, length) → series float",
    description: "Moving average used in RSI. It is the exponentially weighted moving average with alpha = 1 / length.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.rma(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "simple int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.roc': {
    name: 'ta.roc',
    syntax: "ta.roc(source, length) → series float",
    description: "Calculates the percentage of change (rate of change) between the current value of source and its value length bars ago.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.roc(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.rsi': {
    name: 'ta.rsi',
    syntax: "ta.rsi(source, length) → series float",
    description: "Relative strength index. It is calculated using the ta.rma() of upward and downward changes of source over the last length bars.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.rsi(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "simple int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.sar': {
    name: 'ta.sar',
    syntax: "ta.sar(start, inc, max) → series float",
    description: "Parabolic SAR (parabolic stop and reverse) is a method devised by J. Welles Wilder, Jr., to find potential reversals in the market price direction of traded goods.",
    requiredParams: ["start"],
    optionalParams: ["inc","max"],
    signature: "ta.sar(start, inc, max) → series float",
    parameters: [
        {
          "name": "start",
          "type": "simple int/float",
          "description": "Start.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "inc",
          "type": "simple int/float",
          "description": "Increment.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "max",
          "type": "simple int/float",
          "description": "Maximum.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.sma': {
    name: 'ta.sma',
    syntax: "ta.sma(source, length) → series float",
    description: "The sma function returns the moving average, that is the sum of last y values of x, divided by y.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.sma(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.stdev': {
    name: 'ta.stdev',
    syntax: "ta.stdev(source, length, biased) → series float",
    description: "source (series int/float) Series of values to process.",
    requiredParams: ["source"],
    optionalParams: ["length","biased"],
    signature: "ta.stdev(source, length, biased) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "biased",
          "type": "series bool",
          "description": "Determines which estimate should be used. Optional. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ta.stoch': {
    name: 'ta.stoch',
    syntax: "ta.stoch(source, high, low, length) → series float",
    description: "Stochastic. It is calculated by a formula: 100 * (close - lowest(low, length)) / (highest(high, length) - lowest(low, length)).",
    requiredParams: ["source"],
    optionalParams: ["high","low","length"],
    signature: "ta.stoch(source, high, low, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Source series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "high",
          "type": "series int/float",
          "description": "Series of high.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "low",
          "type": "series int/float",
          "description": "Series of low.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Length (number of bars back).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.supertrend': {
    name: 'ta.supertrend',
    syntax: "ta.supertrend(factor, atrPeriod) → [series float, series float]",
    description: "The Supertrend Indicator. The Supertrend is a trend following indicator.",
    requiredParams: ["factor"],
    optionalParams: ["atrPeriod"],
    signature: "ta.supertrend(factor, atrPeriod) → [series float, series float]",
    parameters: [
        {
          "name": "factor",
          "type": "series int/float",
          "description": "The multiplier by which the ATR will get multiplied.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "atrPeriod",
          "type": "simple int",
          "description": "Length of ATR.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.swma': {
    name: 'ta.swma',
    syntax: "ta.swma(source) → series float",
    description: "Symmetrically weighted moving average with fixed length: 4. Weights: [1/6, 2/6, 2/6, 1/6].",
    requiredParams: ["source"],
    optionalParams: [],
    signature: "ta.swma(source) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Source series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'ta.tr': {
    name: 'ta.tr',
    syntax: "ta.tr(handle_na) → series float",
    description: "Calculates the current bar's true range. Unlike a bar's actual range (high - low), true range accounts for potential gaps by taking the maximum of the current bar's actual range and the absolute distances from the previous bar's close to the current bar's high and low. The formula is: math.max(high - low, math.abs(high - close[1]), math.abs(low - close[1])).",
    requiredParams: ["handle_na"],
    optionalParams: [],
    signature: "ta.tr(handle_na) → series float",
    parameters: [
        {
          "name": "handle_na",
          "type": "simple bool",
          "description": "Defines how the function calculates the result when the previous bar's close is na. If true, the function returns the bar's high - low value. If false, it returns na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'ta.tsi': {
    name: 'ta.tsi',
    syntax: "ta.tsi(source, short_length, long_length) → series float",
    description: "True strength index. It uses moving averages of the underlying momentum of a financial instrument.",
    requiredParams: ["source"],
    optionalParams: ["short_length","long_length"],
    signature: "ta.tsi(source, short_length, long_length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Source series.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "short_length",
          "type": "simple int",
          "description": "Short length.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "long_length",
          "type": "simple int",
          "description": "Long length.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.valuewhen': {
    name: 'ta.valuewhen',
    syntax: "ta.valuewhen(condition, source, occurrence) → series color",
    description: "Returns the value of the source series on the bar where the condition was true on the nth most recent occurrence.",
    requiredParams: ["condition"],
    optionalParams: ["source","occurrence"],
    signature: "ta.valuewhen(condition, source, occurrence) → series color",
    parameters: [
        {
          "name": "condition",
          "type": "series bool",
          "description": "The condition to search for.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "source",
          "type": "series color",
          "description": "The value to be returned from the bar where the condition is met.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "occurrence",
          "type": "simple int",
          "description": "The occurrence of the condition. The numbering starts from 0 and goes back in time, so '0' is the most recent occurrence of condition, '1' is the second most recent and so forth. Must be an integer >= 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.variance': {
    name: 'ta.variance',
    syntax: "ta.variance(source, length, biased) → series float",
    description: "Variance is the expectation of the squared deviation of a series from its mean (ta.sma), and it informally measures how far a set of numbers are spread out from their mean.",
    requiredParams: ["source"],
    optionalParams: ["length","biased"],
    signature: "ta.variance(source, length, biased) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "biased",
          "type": "series bool",
          "description": "Determines which estimate should be used. Optional. The default is true.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ta.vwap': {
    name: 'ta.vwap',
    syntax: "ta.vwap(source, anchor) → series float",
    description: "Volume weighted average price.",
    requiredParams: ["source"],
    optionalParams: ["anchor"],
    signature: "ta.vwap(source, anchor) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Source used for the VWAP calculation.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "anchor",
          "type": "series bool",
          "description": "The condition that triggers the reset of VWAP calculations. When true, calculations reset; when false, calculations proceed using the values accumulated since the previous reset. Optional. The default is equivalent to passing timeframe.change with \"1D\" as its argument.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ta.vwma': {
    name: 'ta.vwma',
    syntax: "ta.vwma(source, length) → series float",
    description: "The vwma function returns volume-weighted moving average of source for length bars back. It is the same as: sma(source * volume, length) / sma(volume, length).",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.vwma(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.wma': {
    name: 'ta.wma',
    syntax: "ta.wma(source, length) → series float",
    description: "The wma function returns weighted moving average of source for length bars back. In wma weighting factors decrease in arithmetical progression.",
    requiredParams: ["source"],
    optionalParams: ["length"],
    signature: "ta.wma(source, length) → series float",
    parameters: [
        {
          "name": "source",
          "type": "series int/float",
          "description": "Series of values to process.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars (length).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ta.wpr': {
    name: 'ta.wpr',
    syntax: "ta.wpr(length) → series float",
    description: "Williams %R. The oscillator shows the current closing price in relation to the high and low of the past 'length' bars.",
    requiredParams: ["length"],
    optionalParams: [],
    signature: "ta.wpr(length) → series float",
    parameters: [
        {
          "name": "length",
          "type": "series int",
          "description": "Number of bars.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'table': {
    name: 'table',
    syntax: "table(x) → series table",
    description: "Casts na to table",
    requiredParams: ["x"],
    optionalParams: [],
    signature: "table(x) → series table",
    parameters: [
        {
          "name": "x",
          "type": "series table",
          "description": "The value to convert to the specified type, usually na.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'table.cell': {
    name: 'table.cell',
    syntax: "table.cell(table_id, column, row, text, width, height, text_color, text_halign, text_valign, text_size, bgcolor, tooltip, text_font_family, text_formatting) → void",
    description: "The function defines a cell in the table and sets its attributes.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","text","width","height","text_color","text_halign","text_valign","text_size","bgcolor","tooltip","text_font_family","text_formatting"],
    signature: "table.cell(table_id, column, row, text, width, height, text_color, text_halign, text_valign, text_size, bgcolor, tooltip, text_font_family, text_formatting) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text",
          "type": "series string",
          "description": "The text to be displayed inside the cell. Optional. The default is empty string.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "width",
          "type": "series int/float",
          "description": "The width of the cell as a % of the indicator's visual space. Optional. By default, auto-adjusts the width based on the text inside the cell. Value 0 has the same effect.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "height",
          "type": "series int/float",
          "description": "The height of the cell as a % of the indicator's visual space. Optional. By default, auto-adjusts the height based on the text inside of the cell. Value 0 has the same effect.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_color",
          "type": "series color",
          "description": "The color of the text. Optional. The default is color.black.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_halign",
          "type": "series string",
          "description": "The horizontal alignment of the cell's text. Optional. The default value is text.align_center. Possible values: text.align_left, text.align_center, text.align_right.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_valign",
          "type": "series string",
          "description": "The vertical alignment of the cell's text. Optional. The default value is text.align_center. Possible values: text.align_top, text.align_center, text.align_bottom.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_size",
          "type": "series int/string",
          "description": "Size of the object. The size can be any positive integer, or one of the size.* built-in constant strings. The constant strings and their equivalent integer values are: size.auto (0), size.tiny (8), size.small (10), size.normal (14), size.large (20), size.huge (36). The default value is size.normal or 14.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "bgcolor",
          "type": "series color",
          "description": "The background color of the text. Optional. The default is no color.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "tooltip",
          "type": "series string",
          "description": "The tooltip to be displayed inside the cell. Optional.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_font_family",
          "type": "series string",
          "description": "The font family of the text. Optional. The default value is font.family_default. Possible values: font.family_default, font.family_monospace.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "text_formatting",
          "type": "const text_format",
          "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'table.cell_set_bgcolor': {
    name: 'table.cell_set_bgcolor',
    syntax: "table.cell_set_bgcolor(table_id, column, row, bgcolor) → void",
    description: "The function sets the background color of the cell.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","bgcolor"],
    signature: "table.cell_set_bgcolor(table_id, column, row, bgcolor) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "bgcolor",
          "type": "series color",
          "description": "The background color of the cell.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.cell_set_height': {
    name: 'table.cell_set_height',
    syntax: "table.cell_set_height(table_id, column, row, height) → void",
    description: "The function sets the height of cell.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","height"],
    signature: "table.cell_set_height(table_id, column, row, height) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "height",
          "type": "series int/float",
          "description": "The height of the cell as a % of the chart window. Passing 0 auto-adjusts the height based on the text inside of the cell.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.cell_set_text': {
    name: 'table.cell_set_text',
    syntax: "table.cell_set_text(table_id, column, row, text) → void",
    description: "The function sets the text in the specified cell.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","text"],
    signature: "table.cell_set_text(table_id, column, row, text) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text",
          "type": "series string",
          "description": "The text to be displayed inside the cell.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.cell_set_text_color': {
    name: 'table.cell_set_text_color',
    syntax: "table.cell_set_text_color(table_id, column, row, text_color) → void",
    description: "The function sets the color of the text inside the cell.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","text_color"],
    signature: "table.cell_set_text_color(table_id, column, row, text_color) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text_color",
          "type": "series color",
          "description": "The color of the text.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.cell_set_text_font_family': {
    name: 'table.cell_set_text_font_family',
    syntax: "table.cell_set_text_font_family(table_id, column, row, text_font_family) → void",
    description: "The function sets the font family of the text inside the cell.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","text_font_family"],
    signature: "table.cell_set_text_font_family(table_id, column, row, text_font_family) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text_font_family",
          "type": "series string",
          "description": "The font family of the text. Possible values: font.family_default, font.family_monospace.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.cell_set_text_formatting': {
    name: 'table.cell_set_text_formatting',
    syntax: "table.cell_set_text_formatting(table_id, column, row, text_formatting) → void",
    description: "Sets the formatting attributes the drawing applies to displayed text.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","text_formatting"],
    signature: "table.cell_set_text_formatting(table_id, column, row, text_formatting) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text_formatting",
          "type": "const text_format",
          "description": "The formatting of the displayed text. Formatting options support addition. For example, text.format_bold + text.format_italic will make the text both bold and italicized. Possible values: text.format_none, text.format_bold, text.format_italic. Optional. The default is text.format_none.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'table.cell_set_text_halign': {
    name: 'table.cell_set_text_halign',
    syntax: "table.cell_set_text_halign(table_id, column, row, text_halign) → void",
    description: "The function sets the horizontal alignment of the cell's text.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","text_halign"],
    signature: "table.cell_set_text_halign(table_id, column, row, text_halign) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text_halign",
          "type": "series string",
          "description": "The horizontal alignment of a cell's text. Possible values: text.align_left, text.align_center, text.align_right.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.cell_set_text_size': {
    name: 'table.cell_set_text_size',
    syntax: "table.cell_set_text_size(table_id, column, row, text_size) → void",
    description: "The function sets the size of the cell's text.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","text_size"],
    signature: "table.cell_set_text_size(table_id, column, row, text_size) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text_size",
          "type": "series int/string",
          "description": "Size of the object. The size can be any positive integer, or one of the size.* built-in constant strings. The constant strings and their equivalent integer values are: size.auto (0), size.tiny (8), size.small (10), size.normal (14), size.large (20), size.huge (36). The default value is size.normal or 14.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.cell_set_text_valign': {
    name: 'table.cell_set_text_valign',
    syntax: "table.cell_set_text_valign(table_id, column, row, text_valign) → void",
    description: "The function sets the vertical alignment of a cell's text.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","text_valign"],
    signature: "table.cell_set_text_valign(table_id, column, row, text_valign) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "text_valign",
          "type": "series string",
          "description": "The vertical alignment of the cell's text. Possible values: text.align_top, text.align_center, text.align_bottom.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.cell_set_tooltip': {
    name: 'table.cell_set_tooltip',
    syntax: "table.cell_set_tooltip(table_id, column, row, tooltip) → void",
    description: "The function sets the tooltip in the specified cell.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","tooltip"],
    signature: "table.cell_set_tooltip(table_id, column, row, tooltip) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "tooltip",
          "type": "series string",
          "description": "The tooltip to be displayed inside the cell.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.cell_set_width': {
    name: 'table.cell_set_width',
    syntax: "table.cell_set_width(table_id, column, row, width) → void",
    description: "The function sets the width of the cell.",
    requiredParams: ["table_id"],
    optionalParams: ["column","row","width"],
    signature: "table.cell_set_width(table_id, column, row, width) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "column",
          "type": "series int",
          "description": "The index of the cell's column. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "row",
          "type": "series int",
          "description": "The index of the cell's row. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "width",
          "type": "series int/float",
          "description": "The width of the cell as a % of the chart window. Passing 0 auto-adjusts the width based on the text inside of the cell.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.clear': {
    name: 'table.clear',
    syntax: "table.clear(table_id, start_column, start_row, end_column, end_row) → void",
    description: "The function removes a cell or a sequence of cells from the table. The cells are removed in a rectangle shape where the start_column and start_row specify the top-left corner, and end_column and end_row specify the bottom-right corner.",
    requiredParams: ["table_id"],
    optionalParams: ["start_column","start_row","end_column","end_row"],
    signature: "table.clear(table_id, start_column, start_row, end_column, end_row) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "start_column",
          "type": "series int",
          "description": "The index of the column of the first cell to delete. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "start_row",
          "type": "series int",
          "description": "The index of the row of the first cell to delete. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "end_column",
          "type": "series int",
          "description": "The index of the column of the last cell to delete. Optional. The default is the argument used for start_column. Numbering starts at 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "end_row",
          "type": "series int",
          "description": "The index of the row of the last cell to delete. Optional. The default is the argument used for start_row. Numbering starts at 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'table.delete': {
    name: 'table.delete',
    syntax: "table.delete(table_id) → void",
    description: "The function deletes a table.",
    requiredParams: ["table_id"],
    optionalParams: [],
    signature: "table.delete(table_id) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'table.merge_cells': {
    name: 'table.merge_cells',
    syntax: "table.merge_cells(table_id, start_column, start_row, end_column, end_row) → void",
    description: "The function merges a sequence of cells in the table into one cell. The cells are merged in a rectangle shape where the start_column and start_row specify the top-left corner, and end_column and end_row specify the bottom-right corner.",
    requiredParams: ["table_id"],
    optionalParams: ["start_column","start_row","end_column","end_row"],
    signature: "table.merge_cells(table_id, start_column, start_row, end_column, end_row) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "start_column",
          "type": "series int",
          "description": "The index of the column of the first cell to merge. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "start_row",
          "type": "series int",
          "description": "The index of the row of the first cell to merge. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "end_column",
          "type": "series int",
          "description": "The index of the column of the last cell to merge. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "end_row",
          "type": "series int",
          "description": "The index of the row of the last cell to merge. Numbering starts at 0.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'table.new': {
    name: 'table.new',
    syntax: "table.new(position, columns, rows, bgcolor, frame_color, frame_width, border_color, border_width, force_overlay) → series table",
    description: "The function creates a new table.",
    requiredParams: ["position"],
    optionalParams: ["columns","rows","bgcolor","frame_color","frame_width","border_color","border_width","force_overlay"],
    signature: "table.new(position, columns, rows, bgcolor, frame_color, frame_width, border_color, border_width, force_overlay) → series table",
    parameters: [
        {
          "name": "position",
          "type": "series string",
          "description": "Position of the table. Possible values are: position.top_left, position.top_center, position.top_right, position.middle_left, position.middle_center, position.middle_right, position.bottom_left, position.bottom_center, position.bottom_right.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "columns",
          "type": "series int",
          "description": "The number of columns in the table.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "rows",
          "type": "series int",
          "description": "The number of rows in the table.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "bgcolor",
          "type": "series color",
          "description": "The background color of the table. Optional. The default is no color.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "frame_color",
          "type": "series color",
          "description": "The color of the outer frame of the table. Optional. The default is no color.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "frame_width",
          "type": "series int",
          "description": "The width of the outer frame of the table. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "border_color",
          "type": "series color",
          "description": "The color of the borders of the cells (excluding the outer frame). Optional. The default is no color.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "border_width",
          "type": "series int",
          "description": "The width of the borders of the cells (excluding the outer frame). Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "force_overlay",
          "type": "const bool",
          "description": "If true, the drawing will display on the main chart pane, even when the script occupies a separate pane. Optional. The default is false.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'table.set_bgcolor': {
    name: 'table.set_bgcolor',
    syntax: "table.set_bgcolor(table_id, bgcolor) → void",
    description: "The function sets the background color of a table.",
    requiredParams: ["table_id"],
    optionalParams: ["bgcolor"],
    signature: "table.set_bgcolor(table_id, bgcolor) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "bgcolor",
          "type": "series color",
          "description": "The background color of the table. Optional. The default is no color.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'table.set_border_color': {
    name: 'table.set_border_color',
    syntax: "table.set_border_color(table_id, border_color) → void",
    description: "The function sets the color of the borders (excluding the outer frame) of the table's cells.",
    requiredParams: ["table_id"],
    optionalParams: ["border_color"],
    signature: "table.set_border_color(table_id, border_color) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "border_color",
          "type": "series color",
          "description": "The color of the borders. Optional. The default is no color.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'table.set_border_width': {
    name: 'table.set_border_width',
    syntax: "table.set_border_width(table_id, border_width) → void",
    description: "The function sets the width of the borders (excluding the outer frame) of the table's cells.",
    requiredParams: ["table_id"],
    optionalParams: ["border_width"],
    signature: "table.set_border_width(table_id, border_width) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "border_width",
          "type": "series int",
          "description": "The width of the borders. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'table.set_frame_color': {
    name: 'table.set_frame_color',
    syntax: "table.set_frame_color(table_id, frame_color) → void",
    description: "The function sets the color of the outer frame of a table.",
    requiredParams: ["table_id"],
    optionalParams: ["frame_color"],
    signature: "table.set_frame_color(table_id, frame_color) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "frame_color",
          "type": "series color",
          "description": "The color of the frame of the table. Optional. The default is no color.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'table.set_frame_width': {
    name: 'table.set_frame_width',
    syntax: "table.set_frame_width(table_id, frame_width) → void",
    description: "The function set the width of the outer frame of a table.",
    requiredParams: ["table_id"],
    optionalParams: ["frame_width"],
    signature: "table.set_frame_width(table_id, frame_width) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "frame_width",
          "type": "series int",
          "description": "The width of the outer frame of the table. Optional. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'table.set_position': {
    name: 'table.set_position',
    syntax: "table.set_position(table_id, position) → void",
    description: "The function sets the position of a table.",
    requiredParams: ["table_id"],
    optionalParams: ["position"],
    signature: "table.set_position(table_id, position) → void",
    parameters: [
        {
          "name": "table_id",
          "type": "series table",
          "description": "A table object.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "position",
          "type": "series string",
          "description": "Position of the table. Possible values are: position.top_left, position.top_center, position.top_right, position.middle_left, position.middle_center, position.middle_right, position.bottom_left, position.bottom_center, position.bottom_right.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ticker.heikinashi': {
    name: 'ticker.heikinashi',
    syntax: "ticker.heikinashi(symbol) → simple string",
    description: "Creates a ticker identifier for requesting Heikin Ashi bar values.",
    requiredParams: ["symbol"],
    optionalParams: [],
    signature: "ticker.heikinashi(symbol) → simple string",
    parameters: [
        {
          "name": "symbol",
          "type": "simple string",
          "description": "Symbol ticker identifier.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'ticker.inherit': {
    name: 'ticker.inherit',
    syntax: "ticker.inherit(from_tickerid, symbol) → simple string",
    description: "Constructs a ticker ID for the specified symbol with additional parameters inherited from the ticker ID passed into the function call, allowing the script to request a symbol's data using the same modifiers that the from_tickerid has, including extended session, dividend adjustment, currency conversion, non-standard chart types, back-adjustment, settlement-as-close, etc.",
    requiredParams: ["from_tickerid"],
    optionalParams: ["symbol"],
    signature: "ticker.inherit(from_tickerid, symbol) → simple string",
    parameters: [
        {
          "name": "from_tickerid",
          "type": "simple string",
          "description": "The ticker ID to inherit modifiers from.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "symbol",
          "type": "simple string",
          "description": "The symbol to construct the new ticker ID for.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ticker.kagi': {
    name: 'ticker.kagi',
    syntax: "ticker.kagi(symbol, reversal) → simple string",
    description: "Creates a ticker identifier for requesting Kagi values.",
    requiredParams: ["symbol"],
    optionalParams: ["reversal"],
    signature: "ticker.kagi(symbol, reversal) → simple string",
    parameters: [
        {
          "name": "symbol",
          "type": "simple string",
          "description": "Symbol ticker identifier.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "reversal",
          "type": "simple int/float",
          "description": "Reversal amount (absolute price value).",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ticker.linebreak': {
    name: 'ticker.linebreak',
    syntax: "ticker.linebreak(symbol, number_of_lines) → simple string",
    description: "Creates a ticker identifier for requesting Line Break values.",
    requiredParams: ["symbol"],
    optionalParams: ["number_of_lines"],
    signature: "ticker.linebreak(symbol, number_of_lines) → simple string",
    parameters: [
        {
          "name": "symbol",
          "type": "simple string",
          "description": "Symbol ticker identifier.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "number_of_lines",
          "type": "simple int",
          "description": "Number of line.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ticker.modify': {
    name: 'ticker.modify',
    syntax: "ticker.modify(tickerid, session, adjustment, backadjustment, settlement_as_close) → simple string",
    description: "Creates a ticker identifier for requesting additional data for the script.",
    requiredParams: ["tickerid"],
    optionalParams: ["session","adjustment","backadjustment","settlement_as_close"],
    signature: "ticker.modify(tickerid, session, adjustment, backadjustment, settlement_as_close) → simple string",
    parameters: [
        {
          "name": "tickerid",
          "type": "simple string",
          "description": "Symbol name with exchange prefix, e.g. 'BATS:MSFT', 'NASDAQ:MSFT' or tickerid with session and adjustment from the ticker.new function.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "session",
          "type": "simple string",
          "description": "Session type. Optional argument. Possible values: session.regular, session.extended. Session type of the current chart is syminfo.session. If session is not given, then syminfo.session value is used.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "adjustment",
          "type": "simple string",
          "description": "Adjustment type. Optional argument. Possible values: adjustment.none, adjustment.splits, adjustment.dividends. If adjustment is not given, then default adjustment value is used (can be different depending on particular instrument).",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "backadjustment",
          "type": "simple backadjustment",
          "description": "Specifies whether past contract data on continuous futures symbols is back-adjusted. This setting only affects the data from symbols with this option available on their charts. Optional. The default is backadjustment.inherit, meaning that the modified ticker ID inherits the setting from the ticker ID passed to the tickerid parameter, or it inherits the symbol's default if the tickerid does not specify this setting. Possible values: backadjustment.inherit, backadjustment.on, backadjustment.off.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "settlement_as_close",
          "type": "simple settlement",
          "description": "Specifies whether a futures symbol's close value represents the actual closing price or the settlement price on \"1D\" and higher timeframes. This setting only affects the data from symbols with this option available on their charts. Optional. The default is settlement_as_close.inherit, meaning that the modified ticker ID inherits the setting from the tickerid passed into the function, or it inherits the chart symbol's default if the tickerid does not specify this setting. Possible values: settlement_as_close.inherit, settlement_as_close.on, settlement_as_close.off.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ticker.new': {
    name: 'ticker.new',
    syntax: "ticker.new(prefix, ticker, session, adjustment, backadjustment, settlement_as_close) → simple string",
    description: "Creates a ticker identifier for requesting additional data for the script.",
    requiredParams: ["prefix"],
    optionalParams: ["ticker","session","adjustment","backadjustment","settlement_as_close"],
    signature: "ticker.new(prefix, ticker, session, adjustment, backadjustment, settlement_as_close) → simple string",
    parameters: [
        {
          "name": "prefix",
          "type": "simple string",
          "description": "Exchange prefix. For example: 'BATS', 'NYSE', 'NASDAQ'. Exchange prefix of main series is syminfo.prefix.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "ticker",
          "type": "simple string",
          "description": "Ticker name. For example 'AAPL', 'MSFT', 'EURUSD'. Ticker name of the main series is syminfo.ticker.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "session",
          "type": "simple string",
          "description": "Session type. Optional argument. Possible values: session.regular, session.extended. Session type of the current chart is syminfo.session. If session is not given, then syminfo.session value is used.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "adjustment",
          "type": "simple string",
          "description": "Adjustment type. Optional argument. Possible values: adjustment.none, adjustment.splits, adjustment.dividends. If adjustment is not given, then default adjustment value is used (can be different depending on particular instrument).",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "backadjustment",
          "type": "simple backadjustment",
          "description": "Specifies whether past contract data on continuous futures symbols is back-adjusted. This setting only affects the data from symbols with this option available on their charts. Optional. The default is backadjustment.inherit, meaning that the new ticker ID inherits the symbol's default setting. Possible values: backadjustment.inherit, backadjustment.on, backadjustment.off.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "settlement_as_close",
          "type": "simple settlement",
          "description": "Specifies whether a futures symbol's close value represents the actual closing price or the settlement price on \"1D\" and higher timeframes. This setting only affects the data from symbols with this option available on their charts. Optional. The default is settlement_as_close.inherit, meaning that the new ticker ID inherits the chart symbol's default setting. Possible values: settlement_as_close.inherit, settlement_as_close.on, settlement_as_close.off.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ticker.pointfigure': {
    name: 'ticker.pointfigure',
    syntax: "ticker.pointfigure(symbol, source, style, param, reversal) → simple string",
    description: "Creates a ticker identifier for requesting Point & Figure values.",
    requiredParams: ["symbol"],
    optionalParams: ["source","style","param","reversal"],
    signature: "ticker.pointfigure(symbol, source, style, param, reversal) → simple string",
    parameters: [
        {
          "name": "symbol",
          "type": "simple string",
          "description": "Symbol ticker identifier.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "source",
          "type": "simple string",
          "description": "The source for calculating Point & Figure. Possible values are: 'hl', 'close'.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "style",
          "type": "simple string",
          "description": "Specifies the ticker's box size assignment method. Possible values: \"ATR\" for Average True Range sizing, \"Traditional\" to use a fixed size, or \"PercentageLTP\" to use a percentage of the last trading price.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "param",
          "type": "simple int/float",
          "description": "Represents the ticker's \"ATR length\" value if the style value is \"ATR\", \"Box size\" value if the style is \"Traditional\", or \"Percentage\" value if the style is \"PercentageLTP\".",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "reversal",
          "type": "simple int",
          "description": "Reversal amount.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        }
      ]
  },
  'ticker.renko': {
    name: 'ticker.renko',
    syntax: "ticker.renko(symbol, style, param, request_wicks, source) → simple string",
    description: "Creates a ticker identifier for requesting Renko values.",
    requiredParams: ["symbol"],
    optionalParams: ["style","param","request_wicks","source"],
    signature: "ticker.renko(symbol, style, param, request_wicks, source) → simple string",
    parameters: [
        {
          "name": "symbol",
          "type": "simple string",
          "description": "Symbol ticker identifier.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "style",
          "type": "simple string",
          "description": "Specifies the ticker's box size assignment method. Possible values: \"ATR\" for Average True Range sizing, \"Traditional\" to use a fixed size, or \"PercentageLTP\" to use a percentage of the last trading price.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "param",
          "type": "simple int/float",
          "description": "Represents the ticker's \"ATR length\" value if the style value is \"ATR\", \"Box size\" value if the style is \"Traditional\", or \"Percentage\" value if the style is \"PercentageLTP\".",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": false,
          "optional": true
        },
        {
          "name": "request_wicks",
          "type": "simple bool",
          "description": "Specifies if wick values are returned for Renko bricks. When true, high and low values requested from a symbol using the ticker formed by this function will include wick values when they are present. When false, high and low will always be equal to either open or close. Optional. The default is false. A detailed explanation of how Renko wicks are calculated can be found in our Help Center.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "source",
          "type": "simple string",
          "description": "The source used to calculate bricks. Optional. Possible values: \"Close\", \"OHLC\". The default is \"Close\".",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'ticker.standard': {
    name: 'ticker.standard',
    syntax: "ticker.standard(symbol) → simple string",
    description: "Creates a ticker to request data from a standard chart that is unaffected by modifiers like extended session, dividend adjustment, currency conversion, and the calculations of non-standard chart types: Heikin Ashi, Renko, etc. Among other things, this makes it possible to retrieve standard chart values when the script is running on a non-standard chart.",
    requiredParams: [],
    optionalParams: ["symbol"],
    signature: "ticker.standard(symbol) → simple string",
    parameters: [
        {
          "name": "symbol",
          "type": "simple string",
          "description": "A ticker ID to be converted into its standard form. Optional. The default is syminfo.tickerid.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'time': {
    name: 'time',
    syntax: "time(timeframe, session, bars_back) → series int",
    description: "The time function returns the UNIX time of the current bar for the specified timeframe and session or NaN if the time point is out of session.",
    requiredParams: ["timeframe"],
    optionalParams: ["session","bars_back"],
    signature: "time(timeframe, session, bars_back) → series int",
    parameters: [
        {
          "name": "timeframe",
          "type": "series string",
          "description": "Timeframe. An empty string is interpreted as the current timeframe of the chart.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "session",
          "type": "series string",
          "description": "Session specification. Optional argument, session of the symbol is used by default. An empty string is interpreted as the session of the symbol.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "bars_back",
          "type": "series int",
          "description": "Optional. The bar offset on the script's main timeframe. If the value is positive, the function retrieves the timestamp of the bar N bars back relative to the current bar on the main timeframe. If the value is a negative number from -1 to -500, the function retrieves the expected time of a future bar on that timeframe. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'time_close': {
    name: 'time_close',
    syntax: "time_close(timeframe, session, bars_back) → series int",
    description: "Returns the UNIX time of the current bar's close for the specified timeframe and session, or na if the time point is outside the session. On tick charts and price-based charts such as Renko, line break, Kagi, point & figure, and range, this function returns an na timestamp for the latest realtime bar (because the future closing time is unpredictable), but a valid timestamp for any previous bar.",
    requiredParams: ["timeframe"],
    optionalParams: ["session","bars_back"],
    signature: "time_close(timeframe, session, bars_back) → series int",
    parameters: [
        {
          "name": "timeframe",
          "type": "series string",
          "description": "Resolution. An empty string is interpreted as the current resolution of the chart.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "session",
          "type": "series string",
          "description": "Session specification. Optional argument, session of the symbol is used by default. An empty string is interpreted as the session of the symbol.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        },
        {
          "name": "bars_back",
          "type": "series int",
          "description": "Optional. The bar offset on the script's main timeframe. If the value is positive, the function retrieves the timestamp of the bar N bars back relative to the current bar on the main timeframe. If the value is a negative number from -1 to -500, the function retrieves the expected time of a future bar on that timeframe. The default is 0.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'timeframe.change': {
    name: 'timeframe.change',
    syntax: "timeframe.change(timeframe) → series bool",
    description: "Detects changes in the specified timeframe.",
    requiredParams: ["timeframe"],
    optionalParams: [],
    signature: "timeframe.change(timeframe) → series bool",
    parameters: [
        {
          "name": "timeframe",
          "type": "series string",
          "description": "String formatted according to the User manual's timeframe string specifications.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'timeframe.from_seconds': {
    name: 'timeframe.from_seconds',
    syntax: "timeframe.from_seconds(seconds) → simple string",
    description: "Converts a number of seconds into a valid timeframe string.",
    requiredParams: ["seconds"],
    optionalParams: [],
    signature: "timeframe.from_seconds(seconds) → simple string",
    parameters: [
        {
          "name": "seconds",
          "type": "simple int",
          "description": "The number of seconds in the timeframe.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        }
      ]
  },
  'timeframe.in_seconds': {
    name: 'timeframe.in_seconds',
    syntax: "timeframe.in_seconds(timeframe) → simple int",
    description: "Converts a timeframe string into seconds.",
    requiredParams: [],
    optionalParams: ["timeframe"],
    signature: "timeframe.in_seconds(timeframe) → simple int",
    parameters: [
        {
          "name": "timeframe",
          "type": "simple string",
          "description": "Timeframe string in timeframe string specifications format. Optional. The default is timeframe.period.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'timestamp': {
    name: 'timestamp',
    syntax: "timestamp(dateString) → const int",
    description: "Function timestamp returns UNIX time of specified date and time.",
    requiredParams: [],
    optionalParams: ["dateString"],
    signature: "timestamp(dateString) → const int",
    parameters: [
        {
          "name": "dateString",
          "type": "const string",
          "description": "A string containing the date and, optionally, the time and time zone. Its format must comply with either the IETF RFC 2822 or ISO 8601 standards (\"DD MMM YYYY hh:mm:ss ±hhmm\" or \"YYYY-MM-DDThh:mm:ss±hh:mm\", so \"20 Feb 2020\" or \"2020-02-20\"). If no time is supplied, \"00:00\" is used. If no time zone is supplied, GMT+0 will be used. Note that this diverges from the usual behavior of the function where it returns time in the exchange's timezone.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'weekofyear': {
    name: 'weekofyear',
    syntax: "weekofyear(time, timezone) → series int",
    description: "Calculates the week number of the year, in a specified time zone, from a UNIX timestamp.",
    requiredParams: ["time"],
    optionalParams: ["timezone"],
    signature: "weekofyear(time, timezone) → series int",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "A UNIX timestamp in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "timezone",
          "type": "series string",
          "description": "Optional. Specifies the time zone of the returned week number. The value can be a time zone string in UTC/GMT offset notation (e.g., \"UTC-5\") or IANA time zone database notation (e.g., \"America/New_York\"). The default is syminfo.timezone.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  },
  'year': {
    name: 'year',
    syntax: "year(time, timezone) → series int",
    description: "time (series int) UNIX time in milliseconds.",
    requiredParams: ["time"],
    optionalParams: ["timezone"],
    signature: "year(time, timezone) → series int",
    parameters: [
        {
          "name": "time",
          "type": "series int",
          "description": "UNIX time in milliseconds.",
          "explicitlyOptional": false,
          "explicitlyRequired": false,
          "required": true,
          "optional": false
        },
        {
          "name": "timezone",
          "type": "series string",
          "description": "Allows adjusting the returned value to a time zone specified in either UTC/GMT notation (e.g., \"UTC-5\", \"GMT+0530\") or as an IANA time zone database name (e.g., \"America/New_York\"). Optional. The default is syminfo.timezone.",
          "explicitlyOptional": true,
          "explicitlyRequired": false,
          "optional": true,
          "required": false
        }
      ]
  }
};

// Total functions: 457