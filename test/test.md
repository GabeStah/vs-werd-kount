TODO: Finish introduction list of topics.
# Ruby Exception Handling: NoMethodError

Continuing through our [__Ruby Exception Handling__](https://airbrake.io/blog/ruby-exception-handling/ruby-exception-classes) series, today we'll be taking a look at the `NoMethodError` in Ruby.  As clearly indicated by the name, the `NoMethodError` is raised when a call is made to a receiver (an object) using a method name that doesn't exist.

Throughout this article we'll dig a bit more into the `NoMethodError`, including where it sits within the Ruby `Exception` class hierarchy, as well as reviewing a few simple code examples that illustrate how `NoMethodErrors` can occur.  Let's get to it!

## The Technical Rundown

- All Ruby exceptions are descendants of the [`Exception`](https://airbrake.io/blog/ruby-exception-handling/ruby-exception-classes) class, or a subclass therein.
- [`StandardError`](https://ruby-doc.org/core-2.4.0/StandardError.html) is a direct descendant of the [`Exception`](https://airbrake.io/blog/ruby-exception-handling/ruby-exception-classes) class, and is also a superclass with many descendants of its own.
- [`NameError`](https://ruby-doc.org/core-2.4.0/NameError.html) is a direct descendant of the [`StandardError`](https://ruby-doc.org/core-2.4.0/StandardError.html) class, and is also a superclass with one descendant.
- `NoMethodError` is a direct descendant of the [`NameError`](https://ruby-doc.org/core-2.4.0/NameError.html) class.

## When Should You Use It?

Let's take a look at a common class configuration in Ruby and how we might accidentally produce a `NoMethodError` with an invalid call.  Below is our full code example, including the `Book` class that has an initializer and holds one attribute (as defined by using `attr_accessor`), which is the `title`:

```ruby
def print_exception(exception, explicit)
    puts "[#{explicit ? 'EXPLICIT' : 'INEXPLICIT'}] #{exception.class}: #{exception.message}"
    puts exception.backtrace.join("\n")
end

def execute_examples
    create_book
    invalid_book_method
end

class Book
    # Create getter/setter for title attribute.
    attr_accessor :title

    def initialize(args = {})
        @title = args[:title]
    end
end

def create_book
    begin
        # Create a new book
        book = Book.new(title: 'The Stand')
        # Output book class type.
        puts book
        # Output book title.
        puts book.title
    rescue NoMethodError => e
        print_exception(e, true)
    rescue => e
        print_exception(e, false)
    end    
end

def invalid_book_method
    begin
        # Create a new book
        book = Book.new(title: 'The Stand')
        # Output book class type.
        puts book
        # Output book title.
        puts book.title
        # Output book author (invalid method).
        puts book.author
    rescue NoMethodError => e
        print_exception(e, true)
    rescue => e
        print_exception(e, false)
    end    
end

# Execute examples.
execute_examples
```

Our first function that makes use of the `Book` class is `create_book`:

```ruby
def create_book
    begin
        # Create a new book
        book = Book.new(title: 'The Stand')
        # Output book class type.
        puts book
        # Output book title.
        puts book.title
    rescue NoMethodError => e
        print_exception(e, true)
    rescue => e
        print_exception(e, false)
    end    
end
```

Here we just create a new instance of the `Book` class and assign it to our `book` variable, then we output both the `book` object itself and the `book.title` attribute.  The resulting output is as expected:

```
#<Book:0x0000000282cec0>
The Stand
```

In our second function, `invalid_book_method`, we're also creating a new instance of the `Book` class named `book` and outputting some information, but we also append a call to the `book.author` method:

```ruby
def invalid_book_method
    begin
        # Create a new book
        book = Book.new(title: 'The Stand')
        # Output book class type.
        puts book
        # Output book title.
        puts book.title
        # Output book author (invalid method).
        puts book.author
    rescue NoMethodError => e
        print_exception(e, true)
    rescue => e
        print_exception(e, false)
    end    
end
```

As expected, this raises a `NoMethodError` because `book.author` is an invalid method (we never defined the `author` method within our `Book` class):

```
#<Book:0x0000000282cd58>
The Stand
[EXPLICIT] NoMethodError: undefined method `author' for #<Book:0x0000000282cd58 @title="The Stand">
```

Clearly we should probably have a way to keep track of the author of our books, so we should add the `author` method to our `Book` class.  There are two simple ways to accomplish this.

One option is to continue using the [`attr_accessor`](http://ruby-doc.org/core-2.4.0/Module.html#method-i-attr_accessor) method.  This method provides a bit of fun Ruby magic to our code, by allowing us to tell Ruby that the argument list of `:symbols` we provided should be added to our class as instance variables.  In addition, Ruby will automatically add two new methods to our class, which act as `getter` and `setter` methods with the name of the attribute we provided.

For example, here we're using `attr_accessor` to define the `:author` attribute for our `Book` class (in addition to the previous `:title` attribute we had):

```ruby
class Book
    # Create getter/setter for author and title attribute.
    attr_accessor :author, :title

    # ...
end
```

We removed the unrelated code, but by using `attr_accessor` in this way to define the `:author` attribute, it turns out this is functionally identical to defining the methods ourselves, like so:

```ruby
class Book
    # author getter.
    def author
        @author
    end

    # author setter.
    def author=(value)
        @author = value
    end

    # ...
end
```

Obviously, the `attr_accessor` shortcut is much simpler so that's considered the standard way to approach this problem, but both options are completely viable.  In our case, we'll stick with adding `:title` to our `attr_accessor` argument list, then call the `book_with_author` function:

```ruby
class Book
    # Create getter/setter for author and title attribute.
    attr_accessor :author, :title

    def initialize(args = {})
        @author = args[:author]
        @title = args[:title]
    end
end

def book_with_author
    begin
        # Create a new book
        book = Book.new(author: 'Stephen King', title: 'The Stand')
        # Output book class type.
        puts book
        # Output book title.
        puts book.title
        # Output book author.
        puts book.author
    rescue NoMethodError => e
        print_exception(e, true)
    rescue => e
        print_exception(e, false)
    end    
end
```

Sure enough, this works just fine without raising any errors, and our output includes the previous information, along with the expected `book.author` value:

```
#<Book:0x000000026e78a8>
The Stand
Stephen King
```

To get the most out of your own applications and to fully manage any and all Ruby Exceptions, check out the <a class="js-cta-utm" href="https://airbrake.io/languages/ruby_exception_handling?utm_source=blog&amp;utm_medium=end-post&amp;utm_campaign=airbrake-ruby">Airbrake Ruby</a> exception handling tool, offering real-time alerts and instantaneous insight into what went wrong with your Ruby code, including integrated support for a variety of popular Ruby gems and frameworks.

---

__META DESCRIPTION__

A deeper look at the NoMethodError in Ruby, including functional code examples and a brief review of the attr_accessor method in Ruby.

ES6 brings a new feature to JavaScript which most other programming languages have had for some time: `string interpolation`.  ES6 has named this feature somewhat interesting, instead opting to call them `template literals`, but the functionality is much the same as you may be used to from other languages such as C#, Ruby, Python, and so forth.

A `template literal` is a new type of string literal that uses the backtick (`` ` ``) delimiter instead of the traditional single- or double-quotes.  By defining a string literal with backticks, we're now able to insert interpolated expressions directly inside the string literal.  These interpolated expressions are chunks of code that are evaluated inline as they're parsed, making string creation an (often) cleaner syntax.

For example, here we have a common method for generating a string in traditional JavaScript by concatenating strings together with the `+` character:

```js
// Traditional String Interpolation
var title = 'Robinson Crusoe';
var author = 'Daniel Defoe';

var output = 'Check out ' + title + ', written by ' + author + '.';
console.log(output); // "Check out Robinson Crusoe, written by Daniel Defoe."
```

Using the new backtick syntax to create a `template literal` in ES6, we can now recreate the same `output` string by using `${...}` syntax everywhere we want an interpolated expression.  In this case, we're merely inserting the variables of `title` and `author` as inline evaluations, which are inserted into those positions in the string:

```js
// ES6 Template Literals
var title = 'Robinson Crusoe';
var author = 'Daniel Defoe';

var output = `Check out ${title}, written by ${author}.`;
console.log(output); // "Check out Robinson Crusoe, written by Daniel Defoe."
```

In both cases the output is identical, but the latter string literal is much shorter and easier to read.

### Interpolated Expressions

While we just used simple string variables for interpolation in our previous example, the new `template literals` syntax allows us to insert _any_ valid expression within the `${...}` interpolation statement.  For example, here we've defined the `getYearsBetweenDates()` function, which does as the name describes.  Traditionally we'd still concatenate our evaluated statements with string literals to form our total `output string`:

```js
// Traditional Function Interpolation
function getYearsBetweenDates(a, b) {
    var milliseconds;
    // If no second parameter use current date.
    if (!b) b = new Date();
    // Make sure to subtract largest from smallest.
    a >= b ? milliseconds = a - b : milliseconds = b - a;
    // Reduce milliseconds to years and round.
    return Math.round(milliseconds / (1000 * 60 * 60 * 24 * 365));
}

var name = 'Alice';
var output = name + ' is ' + getYearsBetweenDates(new Date(1985, 1, 20)) + ' years old.';
console.log(output); // Alice is 32 years old.
```

With ES6 and `interpolated expressions` we can simply insert any expression we want inline inside a `${...}` statement and the result is the same:

```js
// ES6 Function Interpolation
var name = 'Alice';
var output = `${name} is ${getYearsBetweenDates(new Date(1985, 1, 20))} years old.`;
console.log(output); // Alice is 32 years old.    
```

This also greatly simplifies inline express interpolations where we'd be performing mathematical calculations such as addition, which must use the same `+` symbol as our concatenation of strings:

```js
// Traditional Mathematical Expression Interpolation
var output = 'One plus two is ' + (1 + 2) + ', while three plus four, which is ' + (3 + 4) + '.';
console.log(output); // One plus two is 3, while three plus four, which is 7.
```

To ensure that the mathematical expression is evaluated separately from the concatenation of the strings and the resulting expression value, traditionally we have to surround our calculation in parentheses `(...)`.  With ES6, we can remove the parentheses entirely and just continue using the same `${...}` syntax:

```js
// ES6 Mathematical Expression Interpolation
var output = `One plus two is ${1 + 2}, while three plus four, which is ${3 + 4}.`;
console.log(output); // One plus two is 3, while three plus four, which is 7.
```

We can go even deeper if we want.  As it happens, template interpolated expressions can be _nested_, meaning we can write a `template literal` inside the interpolated expression of another template literal.  For example, maybe we have a function call that we pass a value to -- such as this `upper()` function below -- and we want to make a few calls to that function but pass in a variable one time, then a slightly modified variable the next.  For example, here we're trying to emphasize the name of `Alice` by making it uppercase, but the second time we call it we're showing possession by also adding an apostrophe plus "s" to the `name` variable before we pass it to the `upper` function.  The result is a fairly message series of calls and concatenations in traditional JavaScript:

```js
// Traditional String Interpolation Within Expression Interpolation 
function upper(a) {
    return a.toUpperCase();
}
var name = 'Alice';
var output = upper(name) + ' sells seashells down by the seashore.  ' + upper( name + "'s" ) + ' special seashells are seagreen.';
console.log(output); // ALICE sells seashells down by the seashore.  ALICE'S special seashells are seagreen.
```

While this produces the output we want, we can dramatically simplify this with the new ES6 syntax by using a `template literal` inside our `interpolated expression` call within our _outer_ template literal, allowing us to (relatively) easily create the possessive form of our `name` noun for the output:

```js
// ES6 String Interpolation Within Expression Interpolation 
var name = 'Alice';
var output = `${upper(name)} sells seashells down by the seashore.  ${upper( `${name}'s` )} special seashells are seagreen.`;
console.log(output); // ALICE sells seashells down by the seashore.  ALICE'S special seashells are seagreen.
```

I leave it to you to determine when it is appropriate to use this new technique, but it's nice to know it's there.  Obviously there is some potential for ugly code if nesting occurs too frequently or too deeply within a single literal, so take care to ensure its use is warranted.

### Tagged Template Literals

Another feature that `template literals` provide in ES6 is known as `tagged template literals`, which allow you to parse the literal strings provided in a template literal by using a function.  It's a bit difficult to describe what that means, so it's best to just show an example and then we can talk about what's going on.

Here we have a function we'll be using to perform our tagging, aptly named `tag()`.  Let's ignore the logic of this for now until after we call this function via a tagged literal to see what it does:

```js
// ES6 Tagged Template Literals
function tag(strings, a, diff, b) {
    // Output the strings array.
    console.log(strings); // ["The number ", " is ", " than the number ", ".", raw: Array(4)]

    // Adjust difference verbiage if necessary.
    diff = 'greater';
    if (a < b) diff = 'less';

    // Return recompiled string.
    return `${strings[0]}${a}${strings[1]}${diff}${strings[2]}${b}${strings[3]}`;
}
```

Here we're calling our `tag` function as a `tagged template literal`, which means we're using the new syntax of: `` functionName`Tagged literal string` ``.  This calls our `tag()` function and passes our template literal as a series of parameters:

```js
var a = 1234;
var b = 5678;

var output = tag`The number ${a} is ${ true } than the number ${b}.`
console.log(output); // The number 1234 is less than the number 5678.
```

If we look back up at the `tag()` function definition we can see that we're expecting a total of four parameters: `strings`, `a`, `diff`, and `b`.  The first argument of a tag function will automatically contain an array of string values which make up the `template literal` string that was passed into it, separated by the `${...}` interpolators, if any exist.  For our example here we see that the `template literal` we passed to our tag function contained three `${...}` interpolations: `The number ${a} is ${ true } than the number ${b}.`

If we were to split our `template literal` string using each `${...}` interpolation statement as a separator, we'd have _four_ strings remaining (don't forget the small string that is solely the final period).  Therefore, `console.log(strings)` shows that the generated `strings` array contains all four of those string values automatically.

The remaining arguments of the tag function are simply the expression interpolations we included in our template literal.  In this case, `a` is equal to `1234` and `b` is equal to `5678`.  `diff` is the interesting parameter because when we call the `tag()` function, we just included the value of `true` for that interpolation.  The reason is that we want to "insert" our own value in place of this `diff` parameter using some simple logic to check if the number `a` is `greater than` or `less than` the number `b`.  In this case `a` is less than `b`, so we set `diff` to `less`.

Finally, for the return statement we concatenate our full `template literal` string once again by alternating through all four values in `strings` with each of the other three parameters.  The result is our intended, formatted string output: `"The number 1234 is less than the number 5678."`

Just to show the logic works as expected, we change the values of `a` and `b` then call `tag()` again:

```js
var a = 99999;
var b = 1;

var output = tag`The number ${a} is ${ true } than the number ${b}.`
console.log(output); // The number 99999 is greater than the number 1.
```

As expected, this time our `diff` value changes to `greater` since `9999` is by far the larger of the two.  As expected, this time our `diff` value changes to `greater` since `9999` is by far the larger of the two.

To help you and your team with JavaScript development, particularly when dealing with unexpected errors, check out the revolutionary <a class="js-cta-utm" href="https://airbrake.io/languages/javascript_exception_handler?utm_source=blog&amp;utm_medium=end-post&amp;utm_campaign=airbrake-js">Airbrake JavaScript</a> error tracking tool for real-time alerts and instantaneous insight into what went wrong with your JavaScript code.

---

__META DESCRIPTION__

Part 3 of our journey through the exciting new features introduced in the latest version of JavaScript, ECMAScript 6 (ES6).

---

__SOURCES__

- https://github.com/getify/You-Dont-Know-JS/tree/master/es6%20%26%20beyond
- https://github.com/lukehoban/es6features
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
- https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes