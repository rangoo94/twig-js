(function() {
    'use strict';

    var Lexer = require('../lexer'),
        trim = require('../trim'),
        TwigLexer = new Lexer(),

        WHITESPACES = [ ' ', '\t', '\n' ];

    /**
     * Find index of first whitespace character after specified index
     *
     * @param {string} str
     * @param {Number} index
     * @returns {Number}
     */
    function findWhitespace(str, index) {
        while (index < str.length) {
            index++;

            if (WHITESPACES.indexOf(str.charAt(index)) !== -1) {
                return index;
            }
        }

        return -1;
    }

    /**
     * Find index of first character after specified index which is not whitespace
     *
     * @param {string} str
     * @param {Number} index
     * @returns {Number}
     */
    function findNotWhitespace(str, index) {
        while (index < str.length) {
            index++;

            if (WHITESPACES.indexOf(str.charAt(index)) === -1) {
                return index;
            }
        }

        return -1;
    }

    /**
     * Understands how nodes are built in plain code
     */
    //TwigLexer.add(function(code, index) {
    //    if (code.charAt(index) === '<') {
    //
    //    }
    //
    //    return null;
    //});

    /**
     * Understands how Twig blocks are built in plain code
     */
    TwigLexer.add(function(code, index) {
        var expression,
            endIndex,
            name;

        if (code.substr(index, 2) === '{%') {
            index += 2;

            index = findNotWhitespace(code, index);

            if (index === -1 || code.substr(index, 2) === '%}') {
                throw new Error('Incorrect block: name not found'); // @TODO: add line and column
            }

            endIndex = findWhitespace(code, index);

            if (endIndex === -1) {
                throw new Error('Incorrect block: whitespace on end not found'); // @TODO: add line and column
            }

            name = code.substr(index, endIndex - index);

            index = endIndex + 1; // + whitespace, not needed

            endIndex = code.indexOf('%}', index); // @TODO: allow strings with this text meanwhile

            if (endIndex === -1) {
                throw new Error('Incorrect block: closing not found'); // @TODO: add line and column
            }

            expression = trim(code.substr(index, endIndex - index));

            return {
                type: 'block',
                name: name,
                expression: expression === '' ? null : expression,
                end: endIndex + 2
            };
        }

        return null;
    });

    /**
     * Understands how Twig expressions are built in plain code
     */
    TwigLexer.add(function(code, index) {
        var expression,
            endIndex;

        if (code.substr(index, 2) === '{{') {
            index += 2;

            endIndex = code.indexOf('}}', index);

            // @TODO: use ExpressionLexer
            expression = code.substr(index, endIndex - index);

            return {
                type: 'expression',
                expression: expression,
                end: endIndex + 2
            };
        }

        return null;
    });

    module.exports = TwigLexer;
}());
