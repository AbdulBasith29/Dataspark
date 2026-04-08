import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AIChatbot from "../chatbot/AIChatbot.jsx";
import SQLJoins from "../visualizations/SQLJoins.jsx";
import TrainValTestSplit from "../visualizations/TrainValTestSplit.jsx";
import PythonMutabilityViz from "../visualizations/PythonMutabilityViz.jsx";
import FStringBuilderViz from "../visualizations/FStringBuilderViz.jsx";
import DictSetOpsViz from "../visualizations/DictSetOpsViz.jsx";
import ComprehensionBuilderViz from "../visualizations/ComprehensionBuilderViz.jsx";
import DataFrameExplorerViz from "../visualizations/DataFrameExplorerViz.jsx";
import ArrayShapeViz from "../visualizations/ArrayShapeViz.jsx";
import LoopVsVectorViz from "../visualizations/LoopVsVectorViz.jsx";
import IteratorStepViz from "../visualizations/IteratorStepViz.jsx";
import ObjectMemoryViz from "../visualizations/ObjectMemoryViz.jsx";
import VizLabShell from "../components/platform/VizLabShell.jsx";
import { DS, dsGlassCard } from "../lib/ds-platform-tokens.js";
import { PYTHON_QUESTIONS } from "../data/questions-python.js";
import { STATISTICS_QUESTIONS } from "../data/questions-statistics.js";

// Combined question bank — add new courses here as banks are built
const ALL_QUESTIONS = [...PYTHON_QUESTIONS, ...STATISTICS_QUESTIONS];

const PlatformLogo = () => (
  <svg width="26" height="26" viewBox="0 0 40 40" fill="none" style={{ display: "block", flexShrink: 0 }}>
    <circle cx="20" cy="8" r="4" fill={DS.ind} /><circle cx="10" cy="30" r="4" fill={DS.grn} />
    <circle cx="30" cy="30" r="4" fill={DS.ind} /><circle cx="20" cy="20" r="4.5" fill={DS.t2} />
    <line x1="20" y1="8" x2="20" y2="20" stroke={DS.ind} strokeWidth="2" opacity=".5" />
    <line x1="10" y1="30" x2="20" y2="20" stroke={DS.grn} strokeWidth="2" opacity=".5" />
    <line x1="30" y1="30" x2="20" y2="20" stroke={DS.ind} strokeWidth="2" opacity=".5" />
  </svg>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATASPARK — Complete Data Science Learning Platform
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── FULL CURRICULUM DATA ────────────────────────────────────────────────────
const CURRICULUM = [
  {
    id: "python",
    title: "Python Fundamentals",
    icon: "🐍",
    color: "#3B82F6",
    accent: "#60A5FA",
    description: "The foundation of every data science career. Master Python's core — not just syntax, but how to think programmatically.",
    topics: [
      {
        id: "py-basics",
        title: "Core Syntax & Data Types",
        lessons: [
          {
            id: "py-b1", title: "Variables, Types & Type Hints", duration: "15 min", hasViz: true,
            linkedQuestionId: "py-q01",
            concepts: [
              {
                heading: "Python is Dynamically Typed",
                body: "Python infers variable types at runtime — you never declare them. This makes code fast to write, but requires discipline: a column you expect to be numeric can silently arrive as a string, causing 1+2='12' instead of 3.",
                code: "x = 42          # int\nx = 'hello'     # now str — valid!\nx = [1, 2, 3]   # now list — still valid\nprint(type(x))  # <class 'list'>",
                dsNote: "Silent type bugs are the #1 cause of pipeline failures. Always validate types at data ingestion boundaries."
              },
              {
                heading: "Type Hints Make Code Self-Documenting",
                body: "PEP 484 lets you annotate variable and function types. They don't enforce anything at runtime — they're documentation that tools like mypy check statically before your code runs.",
                code: "def parse_value(raw: str, default: int = 0) -> int:\n    try:\n        return int(raw)\n    except ValueError:\n        return default\n\n# mypy catches this mistake before production:\nresult: str = parse_value('42')  # Error: expected str, got int",
                dsNote: "Production ML pipelines at Google and Stripe use type hints throughout. They catch 'expected ndarray, got DataFrame' bugs at review time, not at 3am."
              }
            ],
            takeaways: [
              "Python is dynamically typed — types are inferred at runtime, not declared",
              "Type hints (x: int = 5) are optional but strongly recommended in production code",
              "Use isinstance(x, int) not type(x) == int — it handles inheritance correctly",
              "Validate types at system boundaries: user input, API responses, file reads"
            ]
          },
          {
            id: "py-b2", title: "Strings, f-strings & String Methods", duration: "12 min", hasViz: true,
            linkedQuestionId: "py-q23",
            concepts: [
              {
                heading: "f-strings Are the Modern Standard",
                body: "f-strings (PEP 498) are the fastest and most readable way to format strings in Python 3.6+. They evaluate expressions inline at runtime — use them for logging, error messages, and SQL query building.",
                code: "name = 'Alice'\nage = 30\n# Old way — don't do this:\nmsg = 'User %s is %d years old' % (name, age)\n# New way:\nmsg = f'User {name} is {age} years old'\n# Expressions work too:\nmsg = f'In 5 years: {age + 5}'",
                dsNote: "In data pipelines, f-strings build dynamic SQL, log record counts, and format error messages. 'Processed {len(df):,} rows in {elapsed:.2f}s' is cleaner than any alternative."
              },
              {
                heading: "Key String Methods for Data Cleaning",
                body: "Real-world data is messy. Python's built-in string methods handle the most common cleaning tasks without importing anything extra.",
                code: "raw = '  Alice Smith  '\nraw.strip()          # 'Alice Smith' — remove whitespace\nraw.lower()          # '  alice smith  '\nraw.split()          # ['Alice', 'Smith']\n','.join(['a','b']) # 'a,b'\n'hello'.startswith('he')  # True\n'user@co.com'.split('@')[1]  # 'co.com'",
                dsNote: "str.strip(), str.lower(), and str.split() appear in almost every data cleaning pipeline. Mastering them means fewer pandas apply() calls and faster preprocessing."
              }
            ],
            takeaways: [
              "Use f-strings for all string formatting — they're fastest and most readable",
              "Chaining methods is idiomatic: value.strip().lower().replace('-', '_')",
              "str.split() and str.join() are inverses — split to parse, join to serialize",
              "For heavy text processing in pandas, .str accessor gives vectorized string ops"
            ]
          },
          {
            id: "py-b3", title: "Lists, Tuples & Mutability", duration: "18 min", hasViz: true,
            linkedQuestionId: "py-q05",
            concepts: [
              {
                heading: "Lists Are Mutable, Tuples Are Not",
                body: "Lists can be changed after creation — you can append, remove, or replace elements. Tuples are fixed once created. This distinction matters for performance, safety, and how Python stores data in memory.",
                code: "# List — mutable:\nscores = [85, 92, 78]\nscores.append(95)     # modifies in place\nscores[0] = 100       # works\n\n# Tuple — immutable:\npoint = (10, 20)\n# point[0] = 5       # TypeError!\nnew_point = (5, 20)  # must create new tuple",
                dsNote: "Use tuples for fixed records (coordinates, RGB values, DB row keys). Use lists when the collection will grow or change. Tuples are hashable — they can be dict keys and set members."
              },
              {
                heading: "Shallow vs Deep Copy Gotcha",
                body: "Assigning a list to a new variable doesn't copy it — both names point to the same object. This causes one of the most common Python bugs in data work.",
                code: "original = [1, 2, 3]\nalias = original      # SAME object!\nalias.append(4)\nprint(original)       # [1, 2, 3, 4] — surprise!\n\n# Fix: copy it\nshallow = original.copy()  # or list(original)\nimport copy\ndeep = copy.deepcopy(original)  # for nested lists",
                dsNote: "Pandas DataFrames have the same issue. df2 = df is an alias. df2 = df.copy() is a real copy. Modifying an alias silently changes your original data."
              }
            ],
            takeaways: [
              "Lists are mutable (append, remove, reassign); tuples are immutable",
              "Assignment (b = a) creates an alias, not a copy — use .copy() or list()",
              "Tuples are hashable and faster to create; use them for fixed records",
              "list comprehensions are faster than for-loops + append for building new lists"
            ],
            interviewInsights: [
              {
                q: "Is b = a a copy?",
                a: "No — it's an alias. Both names point to the same object. Use b = a.copy() for a shallow copy, or copy.deepcopy(a) for nested structures.",
              },
              {
                q: "Why can't lists be dict keys?",
                a: "Dict keys must be hashable. Mutable objects aren't hashable because their hash value could change if mutated. Tuples are hashable; lists are not. This comes up in every graph/cache interview question.",
              },
              {
                q: "What does a += [4] actually do vs a = a + [4]?",
                a: "a += [4] calls __iadd__ — it mutates in place, same id(). a = a + [4] creates a new list and rebinds a, new id(). Interviewers use this to check if you understand Python's data model.",
              },
            ],
            scenario: {
              prompt: "You're debugging a batch ETL job. A helper function clean_record(record) is supposed to sanitise a row without affecting the caller's data. But the original records are getting modified. What's the bug, and how do you fix it?",
              answer: "clean_record is mutating the dict or list passed in — Python passes object references, not copies. The fix is to copy at the function boundary: record = record.copy() or copy.deepcopy(record) at the top of the function.",
              seniorInsight: "A senior engineer adds a defensive copy at every function boundary that shouldn't own the data, and uses type annotations (record: dict → dict) to make the contract clear. For production pipelines, consider dataclasses with frozen=True to make records genuinely immutable.",
            },
          },
          {
            id: "py-b4", title: "Dictionaries & Sets", duration: "15 min", hasViz: true,
            linkedQuestionId: "py-q02",
            concepts: [
              {
                heading: "Dicts Are O(1) Lookup — Use Them",
                body: "Python dicts use hash tables internally, giving O(1) average-case lookup, insert, and delete. This makes them the right data structure for any mapping, counting, or caching operation.",
                code: "# Count word frequencies in O(n)\ncounts = {}\nfor word in text.split():\n    counts[word] = counts.get(word, 0) + 1\n\n# Better: use defaultdict or Counter\nfrom collections import Counter\ncounts = Counter(text.split())\ncounts.most_common(5)",
                dsNote: "In ML feature engineering, dicts power lookup tables, target encoding maps, and label-to-index mappings. O(1) lookup instead of O(n) list scan matters at 10M+ rows."
              },
              {
                heading: "Sets for Fast Membership Testing",
                body: "Sets store unique values in a hash table — membership testing (x in my_set) is O(1) vs O(n) for lists. Use sets to deduplicate and to do fast intersection/union/difference operations.",
                code: "# O(n) — bad for large data:\nif user_id in user_list:  # scans entire list\n\n# O(1) — good:\nuser_set = set(user_ids)\nif user_id in user_set:\n\n# Set operations:\nactive & premium   # intersection\nall_users - churned  # difference",
                dsNote: "Set intersection is the fast way to find users in both A and B segments. Converting a million-item list to a set before repeated lookups reduces O(n²) to O(n)."
              }
            ],
            takeaways: [
              "Dict lookup, insert, delete are O(1) average — the go-to for mappings and caches",
              "dict.get(key, default) avoids KeyError without try/except",
              "Sets give O(1) membership testing — convert lists to sets before repeated lookups",
              "Use collections.Counter for frequency counting, defaultdict to avoid key initialization"
            ]
          },
          {
            id: "py-b5", title: "Comprehensions: The Pythonic Way", duration: "10 min", hasViz: true,
            linkedQuestionId: "py-q31",
            concepts: [
              {
                heading: "List/Dict/Set Comprehensions Replace Loops",
                body: "Comprehensions are a compact, readable way to transform or filter collections. They run faster than equivalent for-loops with .append() because they're optimized at the bytecode level.",
                code: "# For-loop version:\nclean = []\nfor x in raw_prices:\n    if x > 0:\n        clean.append(round(x, 2))\n\n# Comprehension — faster and clearer:\nclean = [round(x, 2) for x in raw_prices if x > 0]\n\n# Dict comprehension:\nindex = {item['id']: item for item in records}\n\n# Set comprehension:\ndomains = {email.split('@')[1] for email in emails}",
                dsNote: "Dict comprehensions for building lookup tables from lists are a daily pattern in data engineering: {row['user_id']: row for row in db_result} gives O(1) user lookup."
              },
              {
                heading: "Generator Expressions Save Memory",
                body: "Replace square brackets with parentheses to get a generator — it produces items lazily instead of building the full list in memory. Critical for large datasets.",
                code: "# List comprehension — all 10M items in RAM:\ntotals = [price * qty for price, qty in orders]\n\n# Generator — one item at a time:\ntotals = (price * qty for price, qty in orders)\nprint(sum(totals))  # sum() consumes lazily\n\n# Use with any function that accepts iterables:\nmax(x**2 for x in numbers)  # no list created",
                dsNote: "When processing 10GB CSV files, generator expressions allow line-by-line processing without loading the whole file. sum(), max(), and min() all accept generators."
              }
            ],
            takeaways: [
              "List comprehensions are faster than for-loop + append — prefer them for transformation",
              "Add an if clause to filter: [x for x in data if x > 0]",
              "Dict comprehensions build lookup tables: {k: v for k, v in pairs}",
              "Use generator expressions (parentheses) instead of list comprehensions when you only need to iterate once — saves memory"
            ]
          },
        ]
      },
      {
        id: "py-control",
        title: "Control Flow & Functions",
        lessons: [
          {
            id: "py-c1", title: "Conditionals & Pattern Matching", duration: "12 min", hasViz: true,
            linkedQuestionId: "py-q06",
            concepts: [
              {
                heading: "if/elif/else and Truthiness",
                body: "Python's truthiness rules mean you rarely need explicit == comparisons. Empty lists, empty strings, 0, and None all evaluate to False. This enables cleaner guard clauses and early returns.",
                code: "# Explicit — verbose:\nif len(records) > 0 and records is not None:\n\n# Pythonic — cleaner:\nif records:\n    process(records)\n\n# Guard clause pattern:\ndef process(df):\n    if df is None or df.empty:\n        return None  # exit early\n    # main logic here",
                dsNote: "Guard clauses (early returns) keep ML training loops clean. Check for empty DataFrames, None models, or invalid configs at the top of functions — don't nest all logic inside ifs."
              },
              {
                heading: "match/case — Structural Pattern Matching",
                body: "Python 3.10 added structural pattern matching (match/case). It's more powerful than if/elif chains — it can destructure objects and match on type, value, and shape simultaneously.",
                code: "# Clean event routing without long if/elif:\ndef handle_event(event):\n    match event:\n        case {'type': 'click', 'x': x, 'y': y}:\n            return f'Click at ({x},{y})'\n        case {'type': 'scroll', 'delta': d}:\n            return f'Scrolled {d}px'\n        case {'type': 'error', 'code': c}:\n            return f'Error {c}'\n        case _:\n            return 'Unknown event'",
                dsNote: "Use match/case for routing ML pipeline stages, parsing event types from Kafka streams, or handling different API response shapes cleanly."
              }
            ],
            takeaways: [
              "Truthy/falsy: 0, '', [], {}, None, False are all falsy — use 'if data:' not 'if len(data) > 0:'",
              "Use guard clauses (early return) to flatten nested logic",
              "match/case (Python 3.10+) is cleaner than long if/elif chains for multiple conditions",
              "Ternary: x = a if condition else b — good for simple one-liners"
            ]
          },
          {
            id: "py-c2", title: "Loops, Iterators & Generators", duration: "20 min", hasViz: true,
            linkedQuestionId: "py-q07",
            concepts: [
              {
                heading: "Iterators: The Protocol Behind for Loops",
                body: "Every Python for loop calls __iter__() then __next__() repeatedly. Understanding this protocol lets you build memory-efficient data pipelines that process one item at a time instead of loading everything into RAM.",
                code: "# What for x in data: actually does:\niterator = iter(data)      # calls data.__iter__()\nwhile True:\n    try:\n        x = next(iterator)  # calls __iter__().__next__()\n        process(x)\n    except StopIteration:\n        break",
                dsNote: "Pandas read_csv(chunksize=10000) returns an iterator of DataFrames — process 10B rows without loading them all. This is the iterator protocol in production."
              },
              {
                heading: "Generators: Write Iterators Without a Class",
                body: "A generator function uses yield instead of return. Each call to next() runs until the next yield, then pauses — the function's state is preserved between calls. This creates lazy sequences with almost no memory overhead.",
                code: "def read_batches(path, batch_size=1000):\n    batch = []\n    with open(path) as f:\n        for line in f:\n            batch.append(line)\n            if len(batch) == batch_size:\n                yield batch\n                batch = []  # state resets!\n    if batch:\n        yield batch  # last partial batch\n\n# Zero memory overhead — processes one batch at a time:\nfor batch in read_batches('10gb_file.csv'):\n    train_model(batch)",
                dsNote: "This generator pattern powers ETL pipelines that process files too large to fit in memory. It's how pandas chunked reading works internally."
              }
            ],
            takeaways: [
              "Generators use yield — they pause execution and resume, keeping state between calls",
              "Generator functions produce items lazily — perfect for large files and streams",
              "Use enumerate(items) not range(len(items)) when you need index + value",
              "zip(a, b) pairs two iterables — stops at the shorter one"
            ]
          },
          {
            id: "py-c3", title: "Functions: Args, *args, **kwargs", duration: "15 min", hasViz: true,
            linkedQuestionId: "py-q08",
            concepts: [
              {
                heading: "Positional, Keyword, and Default Args",
                body: "Python functions support four kinds of arguments. Knowing when to use each makes your APIs cleaner and less prone to mistakes when called with the wrong parameter order.",
                code: "def fit_model(X, y, lr=0.01, epochs=100, verbose=False):\n    pass\n\n# Positional — order matters:\nfit_model(X_train, y_train)\n\n# Keyword — order doesn't matter:\nfit_model(X_train, y_train, epochs=50, lr=0.001)\n\n# Force keyword-only args with * separator:\ndef plot(data, *, title, figsize=(10,6)):\n    pass  # title MUST be passed as keyword",
                dsNote: "sklearn's fit(X, y, sample_weight=...) uses this exact pattern. Force keyword-only args on ML training functions to prevent silent mistakes like passing labels as features."
              },
              {
                heading: "*args and **kwargs for Flexible APIs",
                body: "*args collects extra positional arguments into a tuple. **kwargs collects extra keyword arguments into a dict. Together they let you write functions that pass arguments through to other functions without knowing them in advance.",
                code: "# Wrapper that adds logging to any function:\ndef logged(fn):\n    def wrapper(*args, **kwargs):  # capture everything\n        print(f'Calling {fn.__name__}')\n        result = fn(*args, **kwargs)  # forward everything\n        print(f'Done: {result}')\n        return result\n    return wrapper\n\n@logged\ndef train(X, y, lr=0.01):\n    return 'model'",
                dsNote: "*args/**kwargs are how sklearn's Pipeline and PyTorch's nn.Module forward() methods work — they pass arguments through layers without knowing their shapes in advance."
              }
            ],
            takeaways: [
              "Default args are evaluated once at function definition — never use mutable defaults (def f(x=[]))",
              "Use * to force callers to pass arguments as keywords, reducing positional mistakes",
              "*args = extra positional args as tuple; **kwargs = extra keyword args as dict",
              "Functions are first-class objects — pass them as arguments, store in dicts, return from functions"
            ]
          },
          {
            id: "py-c4", title: "Lambda, Map, Filter, Reduce", duration: "12 min", hasViz: true,
            linkedQuestionId: "py-q34",
            concepts: [
              {
                heading: "Lambda: Anonymous One-Line Functions",
                body: "lambda creates a small anonymous function inline. Use it only when the function is short and used once — if you need to name it or reuse it, use def instead.",
                code: "# Good use: sort by a key\nrecords.sort(key=lambda r: r['score'], reverse=True)\n\n# Good use: inline with map/filter\nclean = list(filter(lambda x: x > 0, values))\n\n# Bad use — just use def:\nprocess = lambda x, y: x**2 + y**2  # just write def!\n\n# Better in pandas:\ndf.sort_values('score', ascending=False)\ndf[df['score'] > 0]",
                dsNote: "In pandas, lambda appears most in df.apply(lambda row: ...). For simple column operations, vectorized pandas methods (df['col'] * 2) are 10-100x faster than apply()."
              },
              {
                heading: "map() and filter() vs Comprehensions",
                body: "map() applies a function to every item; filter() keeps only items where the function returns True. Both return lazy iterators. In most cases, a list comprehension is more readable — use map/filter when working with functional pipelines.",
                code: "prices = [1.999, 2.505, 0.0, 3.14]\n\n# map() to transform:\nrounded = list(map(lambda x: round(x, 2), prices))\n# Same as: [round(x, 2) for x in prices]\n\n# filter() to select:\npositive = list(filter(lambda x: x > 0, prices))\n# Same as: [x for x in prices if x > 0]\n\n# functools.reduce() to aggregate:\nfrom functools import reduce\ntotal = reduce(lambda a, b: a + b, prices)\n# Same as: sum(prices)",
                dsNote: "Prefer comprehensions for readability. Use map() when passing to libraries that expect iterables, or when chaining many transformations functionally."
              }
            ],
            takeaways: [
              "lambda is for short, throwaway functions — if it's complex, use def",
              "map(fn, iterable) and filter(fn, iterable) return lazy iterators",
              "List comprehensions are usually more readable than map/filter with lambda",
              "functools.reduce() replaces manual accumulation loops — but sum(), max(), any() are clearer for common cases"
            ]
          },
          {
            id: "py-c5", title: "Error Handling & Debugging", duration: "10 min", hasViz: false,
            linkedQuestionId: "py-q09",
            concepts: [
              {
                heading: "try/except: Catch What You Can Handle",
                body: "Catch specific exceptions, not bare except. Bare except silently swallows every error including KeyboardInterrupt and SystemExit. Only catch what you know how to recover from.",
                code: "# Bad — catches everything including SystemExit:\ntry:\n    result = process(data)\nexcept:\n    pass\n\n# Good — specific, with recovery:\ntry:\n    value = int(raw_input)\nexcept ValueError as e:\n    print(f'Invalid number: {e}')\n    value = 0\nexcept (TypeError, OverflowError):\n    value = 0\nfinally:\n    cleanup()  # always runs",
                dsNote: "In ML pipelines, catch specific exceptions at boundaries: FileNotFoundError when loading data, ValueError when parsing features, requests.Timeout when calling APIs. Never silence them inside model training code."
              },
              {
                heading: "Context Managers: with Handles Cleanup",
                body: "The with statement guarantees cleanup code runs even if an exception is raised. It calls __enter__() on open and __exit__() on close. Use it for files, DB connections, and any resource that needs cleanup.",
                code: "# Without context manager — resource leak risk:\nf = open('data.csv')\ntry:\n    data = f.read()\nfinally:\n    f.close()  # easy to forget\n\n# With context manager — automatic cleanup:\nwith open('data.csv') as f:\n    data = f.read()  # f.close() called automatically\n\n# Custom context manager:\nfrom contextlib import contextmanager\n@contextmanager\ndef timer():\n    import time; start = time.time()\n    yield\n    print(f'Elapsed: {time.time()-start:.2f}s')",
                dsNote: "Database connections, file handles, and GPU memory all need explicit cleanup. Context managers ensure __exit__() runs even when exceptions occur — critical for production reliability."
              }
            ],
            takeaways: [
              "Always catch specific exceptions (ValueError, FileNotFoundError) — never bare except",
              "Use finally for cleanup that must always run (close connections, release locks)",
              "with statement calls __exit__() automatically — use for files, DB connections, timers",
              "raise ValueError('descriptive message') beats silent failure every time"
            ]
          },
        ]
      },
      {
        id: "py-oop",
        title: "Object-Oriented Python",
        lessons: [
          {
            id: "py-o1", title: "Classes, Objects & __init__", duration: "18 min", hasViz: true,
            linkedQuestionId: "py-q11",
            concepts: [
              {
                heading: "Classes Define Blueprints, Objects Are Instances",
                body: "__init__ is the constructor — it runs when you create an instance and sets up instance attributes. Class attributes (defined outside __init__) are shared across all instances; instance attributes (self.x) belong to each object.",
                code: "class DataPipeline:\n    default_batch_size = 1000  # class attribute (shared)\n\n    def __init__(self, source: str, batch_size: int = None):\n        self.source = source    # instance attribute\n        self.batch_size = batch_size or self.default_batch_size\n        self._records_processed = 0  # private by convention\n\n    def run(self):\n        print(f'Processing {self.source} in batches of {self.batch_size}')\n\npipeline = DataPipeline('s3://bucket/data.csv')\npipeline.run()",
                dsNote: "sklearn's LinearRegression() uses this exact pattern. fit() sets self.coef_ and self.intercept_ on the instance. Each fitted model is an independent object."
              },
              {
                heading: "@classmethod and @staticmethod",
                body: "@classmethod receives the class as first arg (cls) — use it for alternative constructors. @staticmethod is just a regular function that lives inside the class namespace for organisation.",
                code: "class Dataset:\n    def __init__(self, data, name):\n        self.data = data\n        self.name = name\n\n    @classmethod\n    def from_csv(cls, path):  # alternative constructor\n        import pandas as pd\n        return cls(pd.read_csv(path), name=path)\n\n    @staticmethod\n    def validate_schema(df, required_cols):  # no self/cls needed\n        missing = set(required_cols) - set(df.columns)\n        if missing:\n            raise ValueError(f'Missing columns: {missing}')\n\n# Usage:\nds = Dataset.from_csv('data.csv')",
                dsNote: "sklearn's Pipeline.fit_transform() and pandas' DataFrame.from_dict() are both @classmethod alternative constructors — a common pattern in ML library design."
              }
            ],
            takeaways: [
              "__init__ sets instance attributes; class attributes are shared across all instances",
              "self is just a convention — it's the first argument to instance methods",
              "@classmethod (cls) enables alternative constructors like Model.from_checkpoint()",
              "@staticmethod is a utility function organised inside the class — no self needed"
            ]
          },
          {
            id: "py-o2", title: "Inheritance & Polymorphism", duration: "15 min", hasViz: true,
            linkedQuestionId: "py-q29",
            concepts: [
              {
                heading: "Inheritance Lets Subclasses Extend Behaviour",
                body: "A child class inherits all methods and attributes of its parent. Use super().__init__() to run the parent's constructor, then add your own attributes. Override methods to change behaviour for the subclass.",
                code: "class BaseTransform:\n    def __init__(self, name):\n        self.name = name\n\n    def transform(self, X):\n        raise NotImplementedError  # must override\n\nclass StandardScaler(BaseTransform):\n    def __init__(self):\n        super().__init__('StandardScaler')\n        self.mean_ = None\n        self.std_ = None\n\n    def fit(self, X):\n        self.mean_, self.std_ = X.mean(0), X.std(0)\n\n    def transform(self, X):\n        return (X - self.mean_) / self.std_",
                dsNote: "This is exactly how sklearn builds its transformer API. Every transformer inherits from BaseEstimator, overrides fit() and transform(), and gets fit_transform() for free."
              },
              {
                heading: "Polymorphism: Same Interface, Different Behaviour",
                body: "Polymorphism means different classes can respond to the same method call. Code that calls transform(X) doesn't need to know whether it's a Scaler, Normalizer, or Encoder — they all respond to the same interface.",
                code: "# All transformers share the same interface:\ntransformers = [\n    StandardScaler(),\n    MinMaxScaler(),\n    RobustScaler()\n]\n\n# Polymorphic: each responds to fit/transform differently:\nfor t in transformers:\n    t.fit(X_train)\n    X_transformed = t.transform(X_test)\n    print(f'{t.name}: {X_transformed.std():.3f}')",
                dsNote: "sklearn pipelines exploit polymorphism: Pipeline([('scaler', StandardScaler()), ('model', LogisticRegression())]).fit(X, y) works because both have .fit()."
              }
            ],
            takeaways: [
              "Child classes inherit parent methods — override only what needs to change",
              "Always call super().__init__() to run parent constructor first",
              "Abstract base classes (raise NotImplementedError) document required overrides",
              "Polymorphism lets you swap implementations without changing calling code"
            ]
          },
          {
            id: "py-o3", title: "Dunder Methods & Operator Overloading", duration: "12 min", hasViz: false,
            linkedQuestionId: "py-q13",
            concepts: [
              {
                heading: "Dunder Methods Make Objects Behave Like Builtins",
                body: "Double-underscore methods (__len__, __repr__, __add__) let your classes integrate with Python's built-in operators and functions. When you write len(x), Python calls x.__len__(). This makes custom classes feel native.",
                code: "class DataBatch:\n    def __init__(self, items):\n        self.items = list(items)\n\n    def __len__(self):       # len(batch)\n        return len(self.items)\n\n    def __repr__(self):      # repr(batch)\n        return f'DataBatch({len(self)} items)'\n\n    def __getitem__(self, i):  # batch[i] and for loops\n        return self.items[i]\n\n    def __contains__(self, x):  # x in batch\n        return x in self.items\n\nbatch = DataBatch([1, 2, 3])\nprint(len(batch))      # 3\nprint(batch[0])        # 1\nprint(2 in batch)      # True",
                dsNote: "PyTorch's Dataset class requires __len__ and __getitem__. Implementing them makes your custom datasets work with DataLoader batching automatically."
              },
              {
                heading: "__eq__ and __hash__ for Collections",
                body: "__eq__ controls == comparisons. If you define __eq__, you must also define __hash__ if you want instances to be usable as dict keys or set members (Python sets __hash__ = None automatically when you only define __eq__).",
                code: "class ModelConfig:\n    def __init__(self, lr, layers):\n        self.lr = lr\n        self.layers = layers\n\n    def __eq__(self, other):   # == comparison\n        return self.lr == other.lr and self.layers == other.layers\n\n    def __hash__(self):         # needed for sets/dict keys\n        return hash((self.lr, tuple(self.layers)))\n\n# Now usable in sets:\nconfigs = {ModelConfig(0.01, [64,32]), ModelConfig(0.1, [128])}\nc = ModelConfig(0.01, [64,32])\nprint(c in configs)  # True",
                dsNote: "Hyperparameter deduplication, model registries, and experiment tracking all use __eq__/__hash__ to compare and deduplicate configs."
              }
            ],
            takeaways: [
              "__repr__ should return a string that lets you recreate the object — crucial for debugging",
              "__len__ + __getitem__ makes your class work with len(), indexing, and for loops",
              "Always define __hash__ when you define __eq__ if you need dict keys / set membership",
              "PyTorch Dataset, sklearn transformers, and pandas Series all use dunder methods internally"
            ]
          },
          {
            id: "py-o4", title: "Decorators & Context Managers", duration: "15 min", hasViz: true,
            linkedQuestionId: "py-q38",
            concepts: [
              {
                heading: "Decorators Wrap Functions Without Changing Them",
                body: "A decorator is a function that takes a function and returns a new function. Using @my_decorator above a function definition is syntactic sugar for fn = my_decorator(fn). This lets you add logging, caching, timing, and retries without touching the function body.",
                code: "import functools, time\n\ndef timer(fn):\n    @functools.wraps(fn)  # preserves fn.__name__\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = fn(*args, **kwargs)\n        elapsed = time.perf_counter() - start\n        print(f'{fn.__name__} took {elapsed:.3f}s')\n        return result\n    return wrapper\n\n@timer\ndef train_model(X, y):\n    # ... training code ...\n    return model\n\n# @timer is shorthand for: train_model = timer(train_model)",
                dsNote: "sklearn's @deprecated, Python's @functools.lru_cache, Flask's @app.route — decorators are everywhere in ML tooling. Writing your own unlocks powerful cross-cutting concerns like caching, logging, and retry."
              },
              {
                heading: "functools.wraps and Stacking Decorators",
                body: "Always use @functools.wraps(fn) inside your wrapper — it copies the function's __name__ and __doc__ so debugging tools work correctly. Multiple decorators stack: applied bottom-up, executed outside-in.",
                code: "def retry(max_attempts=3):\n    def decorator(fn):\n        @functools.wraps(fn)\n        def wrapper(*args, **kwargs):\n            for attempt in range(max_attempts):\n                try:\n                    return fn(*args, **kwargs)\n                except Exception as e:\n                    if attempt == max_attempts - 1:\n                        raise\n                    print(f'Attempt {attempt+1} failed: {e}')\n        return wrapper\n    return decorator\n\n@timer          # applied second (outer)\n@retry(3)       # applied first (inner)\ndef fetch_data(url):\n    return requests.get(url).json()",
                dsNote: "The @retry pattern is used in every production data pipeline that calls external APIs. Combine @retry + @timer + @cache for robust, observable data fetching."
              }
            ],
            takeaways: [
              "Decorators wrap functions — @timer is fn = timer(fn) in shorthand",
              "Always use @functools.wraps(fn) to preserve the wrapped function's metadata",
              "Multiple decorators stack bottom-up: @b\\n@a\\ndef f → f = b(a(f))",
              "Parameterised decorators (@retry(3)) need a factory function that returns the decorator"
            ]
          },
        ]
      },
      {
        id: "py-ds",
        title: "Python for Data (NumPy & Pandas)",
        lessons: [
          {
            id: "py-d1", title: "NumPy Arrays & Vectorization", duration: "20 min", hasViz: true,
            linkedQuestionId: "py-q16",
            concepts: [
              {
                heading: "Arrays vs Lists: Why NumPy Matters",
                body: "NumPy arrays store data as contiguous blocks of typed memory (like C arrays). This means math operations run at C speed in vectorized form instead of Python's slow per-element loop. A NumPy operation on 1M elements runs ~100x faster than an equivalent Python list loop.",
                code: "import numpy as np\n\n# Python list — slow, element-by-element:\nresult = [x * 2 for x in range(1_000_000)]  # ~0.2s\n\n# NumPy — vectorized C operation:\narr = np.arange(1_000_000)\nresult = arr * 2  # ~0.002s — 100x faster\n\n# Array operations work element-wise:\na = np.array([1, 2, 3])\nb = np.array([4, 5, 6])\nprint(a + b)   # [5, 7, 9]\nprint(a * b)   # [4, 10, 18]\nprint(a @ b)   # 32 (dot product)",
                dsNote: "Every ML library (sklearn, PyTorch, TensorFlow) is built on NumPy arrays. Understanding shape, dtype, and vectorisation is non-negotiable for data science work."
              },
              {
                heading: "Shape, Reshape, and Broadcasting",
                body: "Arrays have a shape (rows, cols, ...). Reshaping changes the dimensions without copying data. Broadcasting lets NumPy perform operations between arrays of compatible but different shapes — eliminating many loop-heavy patterns.",
                code: "arr = np.arange(12)\nprint(arr.shape)          # (12,)\narr2d = arr.reshape(3, 4)  # 3 rows, 4 cols\nprint(arr2d.shape)        # (3, 4)\n\n# Broadcasting: subtract row means from each row\nX = np.random.randn(100, 5)  # 100 samples, 5 features\nmeans = X.mean(axis=0)       # shape (5,)\nX_centered = X - means       # (100,5) - (5,) broadcasts!",
                dsNote: "Broadcasting removes explicit loops from feature normalisation, distance calculations, and attention score computations. X - means normalises a 100×5 matrix in one line."
              }
            ],
            takeaways: [
              "NumPy arrays are contiguous typed memory — ~100x faster than Python lists for math",
              "Operations are element-wise by default: a + b, a * b add/multiply per position",
              "axis=0 reduces along rows (per-column result); axis=1 reduces along cols (per-row result)",
              "Broadcasting allows operations between compatible shapes without copying data"
            ]
          },
          {
            id: "py-d2", title: "Pandas Series & DataFrames", duration: "25 min", hasViz: true,
            linkedQuestionId: "py-q18",
            concepts: [
              {
                heading: "DataFrames Are Labelled 2D Arrays",
                body: "A pandas DataFrame is a dict of Series (columns) sharing a common index. This gives you both column-name and row-label access. loc uses labels; iloc uses integer positions — never mix them up.",
                code: "import pandas as pd\ndf = pd.read_csv('orders.csv')\n\n# Column selection:\ndf['amount']         # Series\ndf[['amount','user']]  # DataFrame (list of cols)\n\n# Row selection:\ndf.loc[0]            # row with index label 0\ndf.iloc[0]           # first row by position\ndf.loc[0:3, 'amount']  # rows 0-3, amount column\n\n# Boolean indexing:\nbig_orders = df[df['amount'] > 1000]\ndf.loc[df['status'] == 'completed', 'amount']",
                dsNote: "loc vs iloc confusion is one of the top pandas interview gotchas. loc is label-based (inclusive on both ends); iloc is position-based (exclusive end, like Python slices)."
              },
              {
                heading: "Apply vs Vectorized Operations",
                body: "df.apply(fn) runs a Python function row-by-row — it's convenient but slow. Vectorized pandas/numpy operations run in C and are 10-100x faster. Always try vectorised first.",
                code: "# Slow — apply runs Python loop:\ndf['total'] = df.apply(lambda r: r['price'] * r['qty'], axis=1)\n\n# Fast — vectorized:\ndf['total'] = df['price'] * df['qty']  # 10-100x faster\n\n# String operations — vectorized via .str:\ndf['email_domain'] = df['email'].str.split('@').str[1]\ndf['name_upper'] = df['name'].str.upper()\n\n# Datetime — vectorized via .dt:\ndf['day_of_week'] = df['created_at'].dt.day_name()",
                dsNote: "In a 10M-row DataFrame, apply() takes ~60s; the vectorised equivalent takes <1s. This difference between a pipeline that times out and one that completes."
              }
            ],
            takeaways: [
              "loc is label-based (inclusive); iloc is position-based (exclusive end)",
              "Boolean indexing: df[df['col'] > value] filters rows — the go-to selection method",
              "Vectorized ops (df['a'] + df['b']) are 10-100x faster than df.apply(lambda...)",
              "df.dtypes, df.info(), df.describe() are your first three calls on any new dataset"
            ]
          },
          {
            id: "py-d3", title: "GroupBy, Merge, Pivot", duration: "20 min", hasViz: true,
            linkedQuestionId: "py-q19",
            concepts: [
              {
                heading: "GroupBy: Split-Apply-Combine",
                body: "groupby() splits the DataFrame into groups, you apply an aggregation to each group, and pandas combines the results. This is the pandas equivalent of SQL's GROUP BY — and follows the same split-apply-combine pattern.",
                code: "# SQL: SELECT user_id, COUNT(*), SUM(amount) FROM orders GROUP BY user_id\nresult = df.groupby('user_id').agg(\n    order_count=('order_id', 'count'),\n    total_spend=('amount', 'sum'),\n    avg_order=('amount', 'mean')\n).reset_index()\n\n# Multiple aggregations per group:\ndf.groupby(['country', 'category'])['revenue'].agg(['sum','mean','count'])\n\n# Custom function per group:\ndf.groupby('cohort')['retention'].apply(lambda x: (x > 0.3).mean())",
                dsNote: "groupby().agg() is the core of cohort analysis, feature aggregation for ML, and business reporting. Master .agg({'col': 'func'}) and .transform() for window-style operations."
              },
              {
                heading: "Merge: Joining DataFrames Like SQL",
                body: "pd.merge() is SQL JOIN in Python. It supports inner, left, right, and outer joins. Match columns using on= (same name in both) or left_on=/right_on= (different names). Watch for duplicated rows when join keys aren't unique.",
                code: "# Inner join (only matching rows):\nresult = pd.merge(orders, users, on='user_id', how='inner')\n\n# Left join (keep all orders, add user info where available):\nresult = pd.merge(orders, users, on='user_id', how='left')\n\n# Different column names:\nresult = pd.merge(orders, products,\n    left_on='product_id', right_on='id')\n\n# Diagnose unexpected row count growth:\nprint('Before:', len(orders))\nprint('After:', len(result))  # > before = duplicate keys!",
                dsNote: "Always print len() before and after a merge in production. A many-to-many join silently multiplies rows — 1M × 1M = 1T rows — and will crash your pipeline."
              }
            ],
            takeaways: [
              "groupby() follows split-apply-combine: split by key, apply aggregation, combine results",
              "Use .agg({'col': 'func'}) for multiple different aggregations in one pass",
              "merge() is SQL JOIN — inner/left/right/outer behaves exactly like SQL",
              "Always verify row counts after a merge — unexpected growth means duplicate join keys"
            ]
          },
          {
            id: "py-d4", title: "Handling Missing Data", duration: "12 min", hasViz: false,
            linkedQuestionId: "py-q20",
            concepts: [
              {
                heading: "NaN is Not None — Know Your Missing Values",
                body: "pandas uses NaN (float) for numeric missing values and None (Python object) for object columns. They behave differently: NaN propagates in arithmetic, None doesn't. Use pd.isna() / pd.notna() to check both — never == None or == np.nan.",
                code: "import pandas as pd, numpy as np\n\ndf = pd.DataFrame({'a': [1, np.nan, 3], 'b': ['x', None, 'z']})\n\n# Check for missing:\ndf.isna()           # True where NaN or None\ndf.isna().sum()     # count per column\ndf.isna().mean()    # % missing per column\n\n# This does NOT work:\ndf['a'] == np.nan   # always False!\npd.isna(np.nan)     # True — correct way",
                dsNote: "np.nan == np.nan is False — NaN is never equal to itself by IEEE 754 definition. Always use pd.isna() or np.isnan() to detect missing values."
              },
              {
                heading: "Imputation Strategy Depends on the Feature",
                body: "Dropping rows wastes data. Filling with mean works for symmetric distributions. Median is better for skewed data. Forward-fill makes sense for time-series. Predictive imputation is most accurate but expensive.",
                code: "# Drop rows with any missing:\ndf.dropna()\n# Drop only if ALL values are missing:\ndf.dropna(how='all')\n\n# Fill with statistics:\ndf['age'].fillna(df['age'].median())\n\n# Forward fill for time-series:\ndf['price'].fillna(method='ffill')\n\n# Fill with group median (better than global):\ndf['salary'] = df.groupby('job_title')['salary']\\\n    .transform(lambda x: x.fillna(x.median()))",
                dsNote: "Group-based imputation (fill with the median for that user's country/job) consistently outperforms global mean imputation in ML models. The feature distribution within groups is tighter."
              }
            ],
            takeaways: [
              "pd.isna() detects both NaN and None — never use == np.nan (always False)",
              "df.isna().mean() quickly shows % missing per column",
              "Mean imputation is wrong for skewed distributions — use median",
              "Group-based imputation (fill with group median) beats global imputation in ML models"
            ]
          },
          {
            id: "py-d5", title: "Performance: Vectorize Don't Loop", duration: "15 min", hasViz: true,
            linkedQuestionId: "py-q30",
            concepts: [
              {
                heading: "The Performance Hierarchy",
                body: "Operations in pandas have a strict performance hierarchy. From fastest to slowest: vectorised NumPy ops > pandas built-ins > df.apply() column-wise > df.apply(axis=1) row-wise > Python for loop. Most performance problems come from doing row-wise apply when a vectorised solution exists.",
                code: "import time\n\n# Benchmark on 1M rows:\n# Vectorised: 0.002s\ndf['result'] = df['a'] * df['b']\n\n# Column apply: 0.5s (250x slower)\ndf['result'] = df['a'].apply(lambda x: x * 2)\n\n# Row apply: 5s (2500x slower!)\ndf['result'] = df.apply(lambda r: r['a'] * r['b'], axis=1)\n\n# Python loop: 15s+ (don't do this):\nfor i, row in df.iterrows():\n    df.at[i, 'result'] = row['a'] * row['b']",
                dsNote: "Most pandas performance bugs are row-wise apply() that could be replaced by vectorised operations. Before any apply(axis=1), ask: 'Can I express this as column operations?'"
              },
              {
                heading: "np.where and np.select for Conditional Logic",
                body: "np.where(condition, if_true, if_false) is the vectorised ternary — 50-100x faster than apply() for conditional column creation. np.select handles multiple conditions like a vectorised if/elif chain.",
                code: "# Slow apply for conditional:\ndf['label'] = df['score'].apply(\n    lambda x: 'high' if x > 80 else ('medium' if x > 50 else 'low')\n)\n\n# Fast np.select:\nimport numpy as np\nconditions = [df['score'] > 80, df['score'] > 50]\nchoices    = ['high', 'medium']\ndf['label'] = np.select(conditions, choices, default='low')\n\n# Even simpler binary condition: np.where\ndf['passed'] = np.where(df['score'] > 60, 'pass', 'fail')",
                dsNote: "np.where is the standard tool for creating boolean flag columns in feature engineering. It processes the entire column in a single C-level operation."
              }
            ],
            takeaways: [
              "Performance order: vectorised NumPy > pandas built-ins > column apply > row apply > iterrows",
              "Before any apply(axis=1), ask: can I do this with column operations?",
              "np.where(cond, a, b) is vectorised ternary — use it instead of apply for flags",
              "np.select handles multiple conditions vectorised — replaces apply with if/elif chains"
            ]
          },
        ]
      }
    ],
    questions: [
      { id: "pq1", title: "Build a Data Validator Class", difficulty: "Medium", type: "code", prompt: "Create a Python class DataValidator that takes a pandas DataFrame and validates column types, null thresholds, and value ranges based on a config dict. Include proper error reporting.", tags: ["OOP", "pandas", "validation"] },
      { id: "pq2", title: "Implement a LRU Cache from Scratch", difficulty: "Hard", type: "code", prompt: "Implement a Least Recently Used cache using only Python builtins (no functools). Support get(key) and put(key, value) with O(1) time complexity. Use an OrderedDict or build your own doubly-linked list + dict.", tags: ["data-structures", "algorithms", "OOP"] },
      { id: "pq3", title: "Refactor This Messy Script", difficulty: "Easy", type: "code", prompt: "Given a 50-line script that reads a CSV, filters rows, calculates stats, and writes output — all in one giant function with no error handling — refactor it into clean, modular, documented Python.", tags: ["clean-code", "refactoring", "functions"] },
      { id: "pq4", title: "Generator Pipeline for Large Files", difficulty: "Medium", type: "code", prompt: "Write a generator-based pipeline that reads a 10GB CSV file line by line, filters rows where amount > 1000, transforms dates to ISO format, and yields cleaned records without loading the full file into memory.", tags: ["generators", "memory-efficiency", "ETL"] },
      { id: "pq5", title: "Decorator for Function Timing & Logging", difficulty: "Easy", type: "code", prompt: "Write a decorator @profile that logs the function name, arguments, return value, and execution time. It should work with any function signature.", tags: ["decorators", "logging", "functions"] },
    ]
  },
  {
    id: "sql",
    title: "SQL & Databases",
    icon: "🗄️",
    color: "#0EA5E9",
    accent: "#38BDF8",
    description: "The language of data. From basic queries to advanced window functions, CTEs, and query optimization.",
    topics: [
      {
        id: "sql-basics",
        title: "SQL Fundamentals",
        lessons: [
          { id: "sq-b1", title: "SELECT, WHERE, ORDER BY", duration: "12 min", hasViz: false },
          { id: "sq-b2", title: "JOINs Visualized: INNER, LEFT, RIGHT, FULL", duration: "20 min", hasViz: true },
          { id: "sq-b3", title: "GROUP BY & Aggregation Functions", duration: "15 min", hasViz: true },
          { id: "sq-b4", title: "HAVING vs WHERE: When to Filter", duration: "10 min", hasViz: true },
          { id: "sq-b5", title: "Subqueries & Correlated Subqueries", duration: "18 min", hasViz: true },
        ]
      },
      {
        id: "sql-advanced",
        title: "Advanced SQL",
        lessons: [
          { id: "sq-a1", title: "Window Functions: ROW_NUMBER, RANK, DENSE_RANK", duration: "22 min", hasViz: true },
          { id: "sq-a2", title: "LAG, LEAD & Running Calculations", duration: "18 min", hasViz: true },
          { id: "sq-a3", title: "CTEs & Recursive Queries", duration: "20 min", hasViz: true },
          { id: "sq-a4", title: "PIVOT, UNPIVOT & Conditional Aggregation", duration: "15 min", hasViz: false },
          { id: "sq-a5", title: "Query Optimization & EXPLAIN Plans", duration: "25 min", hasViz: true },
        ]
      },
      {
        id: "sql-design",
        title: "Database Design",
        lessons: [
          { id: "sq-d1", title: "Normalization: 1NF → 3NF → BCNF", duration: "20 min", hasViz: true },
          { id: "sq-d2", title: "Indexing Strategies", duration: "18 min", hasViz: true },
          { id: "sq-d3", title: "Star Schema vs Snowflake Schema", duration: "15 min", hasViz: true },
          { id: "sq-d4", title: "OLTP vs OLAP: Choosing the Right DB", duration: "12 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "sqq1", title: "Revenue by Customer Segment", difficulty: "Easy", type: "code", prompt: "Write a query returning each customer segment, unique purchasers, total revenue (completed orders only), and avg order value. Filter to segments with >$10K revenue.", tags: ["joins", "aggregation", "HAVING"] },
      { id: "sqq2", title: "Cohort Retention Analysis", difficulty: "Hard", type: "code", prompt: "Build a monthly cohort retention table showing cohort_month, cohort_size, months_since_signup (0-6), retained_users, and retention_rate for the last 12 months.", tags: ["CTEs", "window-functions", "cohort-analysis"] },
      { id: "sqq3", title: "Funnel Conversion by City", difficulty: "Medium", type: "code", prompt: "Calculate step-over-step conversion rates for a 5-step funnel (app_open → search → select → confirm → complete) broken down by city for the last 30 days.", tags: ["conditional-aggregation", "funnel", "product-analytics"] },
      { id: "sqq4", title: "Recursive Org Chart", difficulty: "Hard", type: "code", prompt: "Using a recursive CTE, generate a full org hierarchy showing employee, manager, level, full chain path, and team size (all direct + indirect reports).", tags: ["recursive-CTE", "hierarchy", "self-join"] },
      { id: "sqq5", title: "Running Total with Gaps", difficulty: "Medium", type: "code", prompt: "Calculate daily signups with a running total, day-over-day change, and 7-day moving average. Handle days with zero signups using a date series.", tags: ["window-functions", "date-series", "running-totals"] },
      { id: "sqq6", title: "Duplicate Detection & Cleanup", difficulty: "Easy", type: "code", prompt: "Find duplicate listings (same host_id, title, city), show counts, then write a DELETE keeping only the most recently updated record per group.", tags: ["deduplication", "ROW_NUMBER", "data-quality"] },
    ]
  },
  {
    id: "statistics",
    title: "Statistics & Probability",
    icon: "📐",
    color: "#8B5CF6",
    accent: "#A78BFA",
    description: "The mathematical backbone. Understand distributions, hypothesis testing, and statistical thinking — not just formulas, but intuition.",
    topics: [
      {
        id: "stat-foundations",
        title: "Descriptive Statistics",
        lessons: [
          { id: "st-f1", title: "Mean, Median, Mode & When Each Matters", duration: "15 min", hasViz: true },
          { id: "st-f2", title: "Variance, Std Dev & The Shape of Data", duration: "18 min", hasViz: true },
          { id: "st-f3", title: "Percentiles, IQR & Outlier Detection", duration: "12 min", hasViz: true },
          { id: "st-f4", title: "Correlation vs Causation (Seriously)", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "stat-probability",
        title: "Probability & Distributions",
        lessons: [
          { id: "st-p1", title: "Bayes' Theorem: Updating Beliefs", duration: "20 min", hasViz: true },
          { id: "st-p2", title: "Normal Distribution & The 68-95-99.7 Rule", duration: "15 min", hasViz: true },
          { id: "st-p3", title: "Binomial, Poisson & When to Use Each", duration: "18 min", hasViz: true },
          { id: "st-p4", title: "Central Limit Theorem: Why Everything is Normal", duration: "20 min", hasViz: true },
        ]
      },
      {
        id: "stat-inference",
        title: "Inferential Statistics",
        lessons: [
          { id: "st-i1", title: "Hypothesis Testing: The Framework", duration: "22 min", hasViz: true },
          { id: "st-i2", title: "P-Values: What They Actually Mean", duration: "18 min", hasViz: true },
          { id: "st-i3", title: "t-Tests, Chi-Squared, ANOVA", duration: "25 min", hasViz: true },
          { id: "st-i4", title: "Confidence Intervals: Precision of Estimates", duration: "15 min", hasViz: true },
          { id: "st-i5", title: "Type I & Type II Errors: The Tradeoff", duration: "15 min", hasViz: true },
          { id: "st-i6", title: "Power Analysis & Sample Size", duration: "18 min", hasViz: true },
        ]
      },
      {
        id: "stat-applied",
        title: "Applied Statistics for DS",
        lessons: [
          { id: "st-a1", title: "A/B Testing: Design to Decision", duration: "25 min", hasViz: true },
          { id: "st-a2", title: "Multiple Testing & Bonferroni Correction", duration: "12 min", hasViz: true },
          { id: "st-a3", title: "Bootstrap Methods", duration: "15 min", hasViz: true },
          { id: "st-a4", title: "Bayesian vs Frequentist: The Debate", duration: "18 min", hasViz: false },
        ]
      }
    ],
    questions: [
      { id: "stq1", title: "A/B Test from Scratch (No Libraries)", difficulty: "Hard", type: "code", prompt: "Implement a full A/B test analysis function: conversion rates, z-test, p-value, 95% CI, and sample size calculation — using only math, no scipy.", tags: ["hypothesis-testing", "z-test", "from-scratch"] },
      { id: "stq2", title: "The PM Says It's Significant at p=0.049", difficulty: "Medium", type: "open-ended", prompt: "Your PM ran 12 A/B tests simultaneously and one came back significant at p=0.049. They want to ship. What do you tell them? Discuss multiple testing, practical significance, and how to communicate this diplomatically.", tags: ["multiple-testing", "communication", "p-values"] },
      { id: "stq3", title: "Choose the Right Statistical Test", difficulty: "Easy", type: "open-ended", prompt: "Given 5 different scenarios (comparing two means, testing independence, comparing proportions, testing normality, comparing 3+ groups), identify the appropriate test and justify why.", tags: ["test-selection", "fundamentals"] },
      { id: "stq4", title: "Power Analysis for a Pricing Experiment", difficulty: "Medium", type: "open-ended", prompt: "Your company wants to test a 5% price increase. Current conversion is 12%. How many users per group do you need? What assumptions are you making? What if the CEO wants results in 1 week?", tags: ["power-analysis", "sample-size", "business-context"] },
      { id: "stq5", title: "Simpson's Paradox in Real Data", difficulty: "Hard", type: "open-ended", prompt: "You find that Drug A has a higher recovery rate overall, but Drug B has a higher rate in every individual subgroup. Explain how this is possible, what you'd recommend, and how you'd present this to a non-technical stakeholder.", tags: ["paradoxes", "confounding", "communication"] },
    ]
  },
  {
    id: "ml",
    title: "Machine Learning",
    icon: "🧠",
    color: "#F59E0B",
    accent: "#FBBF24",
    description: "From linear regression to gradient boosting. Learn to build, evaluate, and deploy ML models that solve real problems.",
    topics: [
      {
        id: "ml-foundations",
        title: "ML Foundations",
        lessons: [
          { id: "ml-f1", title: "Supervised vs Unsupervised vs Reinforcement", duration: "15 min", hasViz: true },
          { id: "ml-f2", title: "Bias-Variance Tradeoff: The Core Tension", duration: "20 min", hasViz: true },
          { id: "ml-f3", title: "Train/Val/Test Split & Cross-Validation", duration: "15 min", hasViz: true },
          { id: "ml-f4", title: "Feature Engineering: The Art", duration: "22 min", hasViz: true },
          { id: "ml-f5", title: "Feature Scaling & Encoding", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "ml-supervised",
        title: "Supervised Learning",
        lessons: [
          { id: "ml-s1", title: "Linear Regression: From Scratch to Intuition", duration: "25 min", hasViz: true },
          { id: "ml-s2", title: "Logistic Regression & Decision Boundaries", duration: "20 min", hasViz: true },
          { id: "ml-s3", title: "Decision Trees: Splitting Criteria Visualized", duration: "22 min", hasViz: true },
          { id: "ml-s4", title: "Random Forests & Bagging", duration: "18 min", hasViz: true },
          { id: "ml-s5", title: "Gradient Boosting: XGBoost & LightGBM", duration: "25 min", hasViz: true },
          { id: "ml-s6", title: "SVM: Margins & Kernels", duration: "20 min", hasViz: true },
        ]
      },
      {
        id: "ml-unsupervised",
        title: "Unsupervised Learning",
        lessons: [
          { id: "ml-u1", title: "K-Means: Clustering Step by Step", duration: "18 min", hasViz: true },
          { id: "ml-u2", title: "DBSCAN & Hierarchical Clustering", duration: "15 min", hasViz: true },
          { id: "ml-u3", title: "PCA: Dimensionality Reduction Visualized", duration: "22 min", hasViz: true },
          { id: "ml-u4", title: "t-SNE & UMAP for Visualization", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "ml-evaluation",
        title: "Model Evaluation & Tuning",
        lessons: [
          { id: "ml-e1", title: "Confusion Matrix, Precision, Recall, F1", duration: "18 min", hasViz: true },
          { id: "ml-e2", title: "ROC Curves & AUC Explained", duration: "15 min", hasViz: true },
          { id: "ml-e3", title: "Hyperparameter Tuning: Grid, Random, Bayesian", duration: "20 min", hasViz: true },
          { id: "ml-e4", title: "Handling Imbalanced Classes", duration: "15 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "mlq1", title: "Churn Feature Engineering Pipeline", difficulty: "Medium", type: "code", prompt: "Build a feature engineering function for churn prediction: compute recency, frequency, monetary features, activity trends, and engagement ratios from raw event logs.", tags: ["feature-engineering", "pandas", "churn"] },
      { id: "mlq2", title: "Model Selection: Why Not Always XGBoost?", difficulty: "Medium", type: "open-ended", prompt: "Your junior DS always defaults to XGBoost. For these 4 scenarios (linear relationship with 10 features, 50M rows with 3 features, highly interpretable model needed for compliance, sparse text data), explain which model you'd choose and why.", tags: ["model-selection", "tradeoffs", "reasoning"] },
      { id: "mlq3", title: "Debug a Leaking Pipeline", difficulty: "Hard", type: "open-ended", prompt: "Your model has 99.2% accuracy in development but 61% in production. Walk through your systematic debugging process. What are the most likely causes? How do you prevent this in the future?", tags: ["data-leakage", "debugging", "ML-pipelines"] },
      { id: "mlq4", title: "End-to-End ML Pipeline", difficulty: "Hard", type: "code", prompt: "Build a complete sklearn pipeline: imputation, encoding, scaling, feature selection, model training with cross-validation, and hyperparameter tuning. Use Pipeline and ColumnTransformer.", tags: ["sklearn", "pipelines", "end-to-end"] },
      { id: "mlq5", title: "Explain Your Model to the CEO", difficulty: "Easy", type: "open-ended", prompt: "You built a gradient boosting model that predicts which customers will churn. The CEO asks 'how does it work?' and 'why should I trust it?'. Explain without jargon. Then explain what SHAP values show.", tags: ["explainability", "communication", "SHAP"] },
    ]
  },
  {
    id: "deep-learning",
    title: "Deep Learning",
    icon: "🔮",
    color: "#EC4899",
    accent: "#F472B6",
    description: "Neural networks from first principles. Build intuition for architectures, then implement with PyTorch.",
    topics: [
      {
        id: "dl-foundations",
        title: "Neural Network Foundations",
        lessons: [
          { id: "dl-f1", title: "Perceptrons & The Universal Approximator", duration: "18 min", hasViz: true },
          { id: "dl-f2", title: "Backpropagation: How Networks Learn", duration: "25 min", hasViz: true },
          { id: "dl-f3", title: "Activation Functions: ReLU, Sigmoid, Tanh", duration: "15 min", hasViz: true },
          { id: "dl-f4", title: "Gradient Descent & Its Variants (SGD, Adam)", duration: "22 min", hasViz: true },
          { id: "dl-f5", title: "Regularization: Dropout, BatchNorm, Weight Decay", duration: "18 min", hasViz: true },
        ]
      },
      {
        id: "dl-architectures",
        title: "Architectures",
        lessons: [
          { id: "dl-a1", title: "CNNs: Convolutions & Feature Maps", duration: "25 min", hasViz: true },
          { id: "dl-a2", title: "RNNs & LSTMs: Sequence Modeling", duration: "22 min", hasViz: true },
          { id: "dl-a3", title: "Transformers: Attention Is All You Need", duration: "30 min", hasViz: true },
          { id: "dl-a4", title: "Transfer Learning & Fine-Tuning", duration: "18 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "dlq1", title: "CNN vs RNN vs Transformer", difficulty: "Medium", type: "open-ended", prompt: "For each scenario (image classification, time series forecasting, document summarization, audio classification), pick the best architecture and explain the tradeoffs.", tags: ["architecture-selection", "tradeoffs"] },
      { id: "dlq2", title: "Training Loss Not Decreasing", difficulty: "Medium", type: "open-ended", prompt: "Your neural network's training loss is flat after 10 epochs. Walk through a systematic debugging checklist: what could be wrong and what would you try in what order?", tags: ["debugging", "training", "practical"] },
      { id: "dlq3", title: "Implement a Simple Neural Network from Scratch", difficulty: "Hard", type: "code", prompt: "Build a 2-layer neural network using only NumPy. Implement forward pass, backprop, and training loop. Train it on a simple classification task.", tags: ["from-scratch", "numpy", "backprop"] },
    ]
  },
  {
    id: "genai",
    title: "GenAI & LLMs",
    icon: "✨",
    color: "#10B981",
    accent: "#34D399",
    description: "The frontier. Understand how LLMs work, how to build with them, and how to evaluate AI-powered systems.",
    topics: [
      {
        id: "genai-foundations",
        title: "LLM Foundations",
        lessons: [
          { id: "ga-f1", title: "How Language Models Actually Work", duration: "22 min", hasViz: true },
          { id: "ga-f2", title: "Tokenization & Embeddings", duration: "18 min", hasViz: true },
          { id: "ga-f3", title: "Attention Mechanism Deep Dive", duration: "25 min", hasViz: true },
          { id: "ga-f4", title: "Fine-Tuning vs RAG vs Prompting", duration: "20 min", hasViz: true },
        ]
      },
      {
        id: "genai-applied",
        title: "Building with LLMs",
        lessons: [
          { id: "ga-a1", title: "Prompt Engineering: Principles & Patterns", duration: "25 min", hasViz: false },
          { id: "ga-a2", title: "RAG: Retrieval Augmented Generation", duration: "22 min", hasViz: true },
          { id: "ga-a3", title: "Agentic Frameworks & LangGraph", duration: "25 min", hasViz: true },
          { id: "ga-a4", title: "Building UIs with Streamlit", duration: "18 min", hasViz: false },
          { id: "ga-a5", title: "LLM Evaluation: How to Know If It's Good", duration: "20 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "aiq1", title: "Design a Data Quality Classifier Prompt", difficulty: "Medium", type: "open-ended", prompt: "Design a system prompt for Claude that classifies CSV data quality. Include the prompt, few-shot strategy, output schema, validation approach, and fallback for misclassification.", tags: ["prompt-engineering", "system-design", "data-quality"] },
      { id: "aiq2", title: "RAG vs Fine-Tuning Decision", difficulty: "Medium", type: "open-ended", prompt: "Your company has 10,000 internal documents and wants an AI assistant for employees. Compare RAG vs fine-tuning across cost, accuracy, freshness, and maintenance. What do you recommend?", tags: ["RAG", "architecture", "decision-making"] },
      { id: "aiq3", title: "LLM Evaluation Pipeline for Text-to-SQL", difficulty: "Hard", type: "open-ended", prompt: "Design an eval pipeline for an LLM text-to-SQL feature. Cover metrics, test data construction, handling multiple valid SQLs, production readiness thresholds, and post-deployment monitoring.", tags: ["evaluation", "text-to-SQL", "MLOps"] },
    ]
  },
  {
    id: "product-sense",
    title: "Product Sense & Business Cases",
    icon: "📊",
    color: "#F97316",
    accent: "#FB923C",
    description: "The questions that separate good from great. Metric design, experiment analysis, stakeholder communication, and ambiguity.",
    topics: [
      {
        id: "ps-metrics",
        title: "Metrics & KPIs",
        lessons: [
          { id: "ps-m1", title: "North Star Metrics: Choosing What Matters", duration: "18 min", hasViz: false },
          { id: "ps-m2", title: "Leading vs Lagging Indicators", duration: "12 min", hasViz: true },
          { id: "ps-m3", title: "Guardrail Metrics: What Shouldn't Break", duration: "10 min", hasViz: false },
          { id: "ps-m4", title: "Metric Decomposition Trees", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "ps-experiment",
        title: "Experimentation",
        lessons: [
          { id: "ps-e1", title: "A/B Test Design: End to End", duration: "25 min", hasViz: true },
          { id: "ps-e2", title: "When A/B Tests Go Wrong", duration: "18 min", hasViz: false },
          { id: "ps-e3", title: "Novelty Effects & Long-Term Holdouts", duration: "12 min", hasViz: true },
          { id: "ps-e4", title: "Network Effects & Interference", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "ps-cases",
        title: "Business Case Studies",
        lessons: [
          { id: "ps-c1", title: "Diagnosing a Metric Drop: Framework", duration: "20 min", hasViz: false },
          { id: "ps-c2", title: "Build vs Buy Decisions", duration: "15 min", hasViz: false },
          { id: "ps-c3", title: "Communicating to Non-Technical Stakeholders", duration: "18 min", hasViz: false },
        ]
      }
    ],
    questions: [
      { id: "psq1", title: "Slack Huddles: Define Success Metrics", difficulty: "Medium", type: "open-ended", prompt: "Slack is launching Huddles. Define the North Star metric, 3-5 supporting metrics, guardrails, 90-day targets, instrumentation plan, and kill criteria.", tags: ["metrics", "product-launch", "KPIs"] },
      { id: "psq2", title: "Conversion Dropped 25% — Now What?", difficulty: "Hard", type: "open-ended", prompt: "DoorDash weekend conversion dropped from 32% to 24%. Walk through your investigation: framework, first 5 analyses, hypotheses ranked, distinguishing data issues from real problems, and what you present to the VP by EOD.", tags: ["metric-investigation", "debugging", "stakeholders"] },
      { id: "psq3", title: "A/B Test Shows Contradictory Results", difficulty: "Hard", type: "open-ended", prompt: "Netflix A/B test: +5% CTR, -3% viewing hours, +8% titles started. PM wants to ship. Content team is worried. Interpret the results, propose additional analyses, and make a recommendation.", tags: ["AB-testing", "tradeoffs", "experimentation"] },
      { id: "psq4", title: "Build vs Buy: ML Monitoring", difficulty: "Medium", type: "open-ended", prompt: "Team of 6, patchwork monitoring. Evaluate build vs buy for ML monitoring. Cover decision criteria, cost comparison, hidden costs, recommendation, and executive presentation.", tags: ["build-vs-buy", "decision-framework", "communication"] },
    ]
  },
  {
    id: "system-design",
    title: "System Design & Architecture",
    icon: "🏗️",
    color: "#6366F1",
    accent: "#818CF8",
    description: "How to design data systems that scale. Pipelines, ML infrastructure, and the architecture decisions interviewers love to ask.",
    topics: [
      {
        id: "sd-pipelines",
        title: "Data Pipeline Architecture",
        lessons: [
          { id: "sd-p1", title: "Batch vs Streaming: When & Why", duration: "20 min", hasViz: true },
          { id: "sd-p2", title: "ETL vs ELT & Modern Data Stack", duration: "18 min", hasViz: true },
          { id: "sd-p3", title: "Kafka, Spark, Flink: The Streaming Trinity", duration: "22 min", hasViz: true },
          { id: "sd-p4", title: "Data Warehouse Design Patterns", duration: "20 min", hasViz: true },
        ]
      },
      {
        id: "sd-ml-systems",
        title: "ML System Design",
        lessons: [
          { id: "sd-m1", title: "ML System Design Framework", duration: "25 min", hasViz: true },
          { id: "sd-m2", title: "Feature Stores & Feature Engineering at Scale", duration: "18 min", hasViz: true },
          { id: "sd-m3", title: "Model Serving: Batch vs Real-Time", duration: "15 min", hasViz: true },
          { id: "sd-m4", title: "Recommendation Systems at Scale", duration: "25 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "sdq1", title: "Real-Time Fraud Detection Pipeline", difficulty: "Hard", type: "open-ended", prompt: "Design a fraud detection pipeline: 10K TPS, <500ms latency, rules + ML, cold start handling, 3x scaling for Black Friday, audit trail. Cover architecture, tech choices, model updates, monitoring, phased rollout.", tags: ["streaming", "fraud", "architecture"] },
      { id: "sdq2", title: "Recommendation System for 400M Users", difficulty: "Hard", type: "open-ended", prompt: "Design a multi-stage recommendation pipeline: candidate gen → ranking → re-ranking. Cover embedding strategy, explore/exploit, offline vs online evaluation, real-time personalization, and cold-start.", tags: ["recommendations", "scale", "ML-systems"] },
      { id: "sdq3", title: "Data Warehouse Migration Plan", difficulty: "Medium", type: "open-ended", prompt: "Migrate from Postgres to cloud warehouse. 5TB data, 300 dbt models, 50 Looker dashboards, team of 7. Cover warehouse choice, migration strategy, zero downtime, validation, dbt changes, timeline.", tags: ["migration", "data-warehouse", "dbt"] },
    ]
  },
  {
    id: "mlops",
    title: "MLOps, Cloud & Tools",
    icon: "⚙️",
    color: "#64748B",
    accent: "#94A3B8",
    description: "The engineering skills that make you production-ready. CI/CD for ML, cloud services, Git, APIs, and environments.",
    topics: [
      {
        id: "mlops-core",
        title: "MLOps Fundamentals",
        lessons: [
          { id: "mo-c1", title: "CI/CD for Machine Learning", duration: "20 min", hasViz: true },
          { id: "mo-c2", title: "Model Versioning & Experiment Tracking", duration: "15 min", hasViz: false },
          { id: "mo-c3", title: "Monitoring & Drift Detection", duration: "18 min", hasViz: true },
          { id: "mo-c4", title: "Automated Retraining Pipelines", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "mlops-tools",
        title: "Essential Tools",
        lessons: [
          { id: "mo-t1", title: "Git Workflows for Data Teams", duration: "18 min", hasViz: true },
          { id: "mo-t2", title: "Virtual Environments: venv, conda, poetry", duration: "12 min", hasViz: false },
          { id: "mo-t3", title: "Building APIs with FastAPI", duration: "22 min", hasViz: false },
          { id: "mo-t4", title: "Docker for Data Scientists", duration: "20 min", hasViz: true },
          { id: "mo-t5", title: "Cloud Basics: AWS for DS", duration: "25 min", hasViz: true },
        ]
      },
      {
        id: "mlops-viz",
        title: "Data Visualization",
        lessons: [
          { id: "mo-v1", title: "Matplotlib & Seaborn: Static Viz Done Right", duration: "20 min", hasViz: true },
          { id: "mo-v2", title: "Plotly: Interactive Visualizations", duration: "18 min", hasViz: true },
          { id: "mo-v3", title: "Dashboard Design Principles", duration: "15 min", hasViz: false },
        ]
      }
    ],
    questions: [
      { id: "moq1", title: "Design a CI/CD Pipeline for ML", difficulty: "Medium", type: "open-ended", prompt: "Design a CI/CD pipeline for an ML model: include linting, testing, data validation, model training, evaluation gates, staging deployment, canary release, and rollback strategy.", tags: ["CI/CD", "MLOps", "deployment"] },
      { id: "moq2", title: "Your Model is Drifting — Now What?", difficulty: "Medium", type: "open-ended", prompt: "You get an alert that your production model's prediction distribution has shifted significantly from training. Walk through your response: investigation, diagnosis, short-term fix, long-term prevention.", tags: ["monitoring", "drift", "production"] },
      { id: "moq3", title: "Build a Model Serving API", difficulty: "Easy", type: "code", prompt: "Build a FastAPI endpoint that loads a trained sklearn model, accepts JSON input, validates it with Pydantic, returns predictions with confidence scores, and handles errors gracefully.", tags: ["FastAPI", "deployment", "API"] },
    ]
  },
  {
    id: "specialized",
    title: "Specialized AI",
    icon: "🎯",
    color: "#EF4444",
    accent: "#F87171",
    description: "Deep dives into recommendation engines, time series analysis, and NLP — the specialized skills that make you stand out.",
    topics: [
      {
        id: "spec-recsys",
        title: "Recommendation Engines",
        lessons: [
          { id: "sp-r1", title: "Collaborative Filtering: User-User & Item-Item", duration: "22 min", hasViz: true },
          { id: "sp-r2", title: "Content-Based Recommendations", duration: "15 min", hasViz: true },
          { id: "sp-r3", title: "Hybrid Systems & Matrix Factorization", duration: "20 min", hasViz: true },
          { id: "sp-r4", title: "Evaluation: Beyond Accuracy", duration: "15 min", hasViz: true },
        ]
      },
      {
        id: "spec-timeseries",
        title: "Time Series Analysis",
        lessons: [
          { id: "sp-t1", title: "Stationarity & Decomposition", duration: "18 min", hasViz: true },
          { id: "sp-t2", title: "ARIMA Family Models", duration: "22 min", hasViz: true },
          { id: "sp-t3", title: "Prophet & Modern Forecasting", duration: "18 min", hasViz: true },
          { id: "sp-t4", title: "LSTM for Sequence Prediction", duration: "20 min", hasViz: true },
        ]
      },
      {
        id: "spec-nlp",
        title: "Natural Language Processing",
        lessons: [
          { id: "sp-n1", title: "Text Preprocessing & Tokenization", duration: "15 min", hasViz: true },
          { id: "sp-n2", title: "Word Embeddings: Word2Vec to BERT", duration: "25 min", hasViz: true },
          { id: "sp-n3", title: "Sentiment Analysis & Text Classification", duration: "18 min", hasViz: false },
          { id: "sp-n4", title: "Named Entity Recognition", duration: "15 min", hasViz: true },
        ]
      }
    ],
    questions: [
      { id: "spq1", title: "Cold Start Problem in Recommendations", difficulty: "Medium", type: "open-ended", prompt: "New users and new items have no interaction history. Design a strategy to handle cold start for both, covering what data you'd use, fallback approaches, and how you'd transition to personalized recommendations.", tags: ["cold-start", "recommendations", "design"] },
      { id: "spq2", title: "Forecast Daily Revenue with Seasonality", difficulty: "Medium", type: "code", prompt: "Given 2 years of daily revenue data with weekly + yearly seasonality and a holiday effect, build a forecasting pipeline. Compare ARIMA, Prophet, and a simple baseline. Evaluate with proper time series CV.", tags: ["forecasting", "time-series", "evaluation"] },
      { id: "spq3", title: "NLP Pipeline for Customer Feedback", difficulty: "Medium", type: "open-ended", prompt: "Your company receives 10K customer reviews daily. Design an NLP pipeline that: classifies sentiment, extracts key topics, identifies urgent issues, and generates a daily summary for the product team.", tags: ["NLP", "pipeline", "product"] },
    ]
  }
];

// ─── INTERACTIVE VISUALIZATIONS ──────────────────────────────────────────────

const NormalDistViz = () => {
  const canvasRef = useRef(null);
  const [mean, setMean] = useState(0);
  const [stdDev, setStdDev] = useState(1);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  const gaussian = (x, m, s) => (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - m) / s) ** 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(1, 1);

    // Generate particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 200; i++) {
        let u1 = Math.random(), u2 = Math.random();
        let z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        particlesRef.current.push({ x: z, y: Math.random(), vy: 0.2 + Math.random() * 0.5, opacity: 0.3 + Math.random() * 0.7, size: 1.5 + Math.random() * 2 });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const xMin = mean - 4 * stdDev;
      const xMax = mean + 4 * stdDev;
      const toCanvasX = (x) => ((x - xMin) / (xMax - xMin)) * W;
      const maxY = gaussian(mean, mean, stdDev);
      const toCanvasY = (y) => H - (y / maxY) * H * 0.78 - 30;

      // Draw filled curve
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let px = 0; px <= W; px += 2) {
        const x = xMin + (px / W) * (xMax - xMin);
        const y = gaussian(x, mean, stdDev);
        ctx.lineTo(px, toCanvasY(y));
      }
      ctx.lineTo(W, H);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(139, 92, 246, 0.3)");
      grad.addColorStop(1, "rgba(139, 92, 246, 0.02)");
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw curve line
      ctx.beginPath();
      for (let px = 0; px <= W; px += 2) {
        const x = xMin + (px / W) * (xMax - xMin);
        const y = gaussian(x, mean, stdDev);
        px === 0 ? ctx.moveTo(px, toCanvasY(y)) : ctx.lineTo(px, toCanvasY(y));
      }
      ctx.strokeStyle = "#A78BFA";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw std dev zones
      [1, 2, 3].forEach((n, i) => {
        const left = toCanvasX(mean - n * stdDev);
        const right = toCanvasX(mean + n * stdDev);
        ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 - i * 0.08})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(left, 0); ctx.lineTo(left, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(right, 0); ctx.lineTo(right, H); ctx.stroke();
        ctx.setLineDash([]);

        const pcts = ["68.3%", "95.4%", "99.7%"];
        ctx.fillStyle = `rgba(167, 139, 250, ${0.6 - i * 0.15})`;
        ctx.font = `${20 - i * 2}px 'JetBrains Mono'`;
        ctx.textAlign = "center";
        ctx.fillText(pcts[i], (left + right) / 2, H - 8 - i * 22);
      });

      // Animate particles
      particlesRef.current.forEach(p => {
        const px = toCanvasX(p.x * stdDev + mean);
        const py = toCanvasY(gaussian(p.x * stdDev + mean, mean, stdDev));
        const dropY = py + p.y * (H - py);
        p.y += p.vy * 0.008;
        if (p.y > 1) { p.y = 0; p.x = (Math.random() - 0.5) * 6; }
        ctx.beginPath();
        ctx.arc(px, dropY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 181, 253, ${p.opacity * (1 - p.y)})`;
        ctx.fill();
      });

      // Mean line
      const meanX = toCanvasX(mean);
      ctx.beginPath(); ctx.moveTo(meanX, 0); ctx.lineTo(meanX, H);
      ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = 2; ctx.setLineDash([6, 3]); ctx.stroke(); ctx.setLineDash([]);

      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 22px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText(`μ = ${mean.toFixed(1)}`, meanX, 30);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [mean, stdDev]);

  return (
    <>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4, fontFamily: "var(--ds-sans), sans-serif" }}>Normal distribution explorer</div>
      <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 16, lineHeight: 1.55 }}>Drag the sliders to see how μ and σ change the shape — same family as the landing “systems” story: intuition first.</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }} />
      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Mean (μ): {mean.toFixed(1)}</div>
          <input type="range" min={-3} max={3} step={0.1} value={mean} onChange={e => setMean(+e.target.value)} style={{ width: "100%", accentColor: DS.indB }} />
        </label>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Std Dev (σ): {stdDev.toFixed(1)}</div>
          <input type="range" min={0.3} max={3} step={0.1} value={stdDev} onChange={e => setStdDev(+e.target.value)} style={{ width: "100%", accentColor: DS.ind }} />
        </label>
      </div>
    </>
  );
};

const GradientDescentViz = () => {
  const canvasRef = useRef(null);
  const [lr, setLr] = useState(0.1);
  const [ballPos, setBallPos] = useState(3.5);
  const [isRunning, setIsRunning] = useState(false);
  const [trail, setTrail] = useState([]);
  const animRef = useRef(null);
  const posRef = useRef(3.5);
  const velRef = useRef(0);

  const f = (x) => 0.15 * (x - 1) * (x - 1) * (x + 2) * (x + 2) + 0.5;
  const df = (x) => 0.15 * (2 * (x - 1) * (x + 2) * (x + 2) + 2 * (x - 1) * (x - 1) * (x + 2));

  const reset = () => { posRef.current = 3.5; velRef.current = 0; setBallPos(3.5); setTrail([]); setIsRunning(false); };

  useEffect(() => {
    if (!isRunning) return;
    const step = () => {
      const grad = df(posRef.current);
      posRef.current -= lr * grad;
      posRef.current = Math.max(-4, Math.min(4, posRef.current));
      setBallPos(posRef.current);
      setTrail(t => [...t.slice(-50), posRef.current]);
      if (Math.abs(grad) > 0.01) animRef.current = setTimeout(step, 80);
      else setIsRunning(false);
    };
    animRef.current = setTimeout(step, 80);
    return () => clearTimeout(animRef.current);
  }, [isRunning, lr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;

    const toX = (x) => ((x + 4.5) / 9) * W;
    const toY = (y) => H - (y / 8) * H * 0.85 - 20;

    ctx.clearRect(0, 0, W, H);

    // Draw function
    const grad = ctx.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, "rgba(249, 115, 22, 0.05)");
    grad.addColorStop(1, "rgba(249, 115, 22, 0.15)");

    ctx.beginPath();
    ctx.moveTo(toX(-4.5), H);
    for (let x = -4.5; x <= 4.5; x += 0.05) {
      ctx.lineTo(toX(x), toY(f(x)));
    }
    ctx.lineTo(toX(4.5), H);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    for (let x = -4.5; x <= 4.5; x += 0.05) {
      x === -4.5 ? ctx.moveTo(toX(x), toY(f(x))) : ctx.lineTo(toX(x), toY(f(x)));
    }
    ctx.strokeStyle = "#F97316";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw trail
    trail.forEach((x, i) => {
      ctx.beginPath();
      ctx.arc(toX(x), toY(f(x)), 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${(i / trail.length) * 0.5})`;
      ctx.fill();
    });

    // Draw ball
    const bx = toX(ballPos);
    const by = toY(f(ballPos));
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#3B82F6";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.strokeStyle = "#60A5FA";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Gradient arrow
    const g = df(ballPos);
    const arrowLen = Math.min(Math.abs(g) * 25, 80);
    const dir = g > 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + dir * arrowLen, by);
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "bold 20px 'JetBrains Mono'";
    ctx.textAlign = "left";
    ctx.fillText(`x = ${ballPos.toFixed(2)}`, 20, 36);
    ctx.fillText(`f(x) = ${f(ballPos).toFixed(2)}`, 20, 62);
    ctx.fillStyle = "#10B981";
    ctx.fillText(`∇f = ${df(ballPos).toFixed(2)}`, 20, 88);
  }, [ballPos, trail]);

  return (
    <>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4, fontFamily: "var(--ds-sans), sans-serif" }}>Gradient descent in action</div>
      <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 16, lineHeight: 1.55 }}>Watch the ball roll downhill following the gradient — learning rate is the step size.</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 250, borderRadius: 12, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }} />
      <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
        <label style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Learning rate: {lr.toFixed(2)}</div>
          <input type="range" min={0.01} max={0.5} step={0.01} value={lr} onChange={e => setLr(+e.target.value)} style={{ width: "100%", accentColor: DS.indB }} />
        </label>
        <button type="button" onClick={() => isRunning ? setIsRunning(false) : setIsRunning(true)} style={{ background: isRunning ? "#EF4444" : DS.indB, border: "none", borderRadius: DS.radiusSm, padding: "8px 20px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "var(--ds-mono), monospace", boxShadow: isRunning ? "none" : DS.shadowCta }}>
          {isRunning ? "Pause" : "Run"}
        </button>
        <button type="button" onClick={reset} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${DS.border}`, borderRadius: DS.radiusSm, padding: "8px 20px", color: DS.t3, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "var(--ds-mono), monospace" }}>
          Reset
        </button>
      </div>
    </>
  );
};

const BiasVarianceViz = () => {
  const [complexity, setComplexity] = useState(3);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.clearRect(0, 0, W, H);

    const bias = (x) => 3.5 * Math.exp(-0.5 * x) + 0.2;
    const variance = (x) => 0.2 + 0.3 * Math.exp(0.35 * x);
    const total = (x) => bias(x) + variance(x);

    const toX = (x) => (x / 10) * W * 0.9 + W * 0.05;
    const toY = (y) => H - (y / 6) * H * 0.8 - H * 0.08;

    // Draw curves
    const drawCurve = (fn, color, label, labelX) => {
      ctx.beginPath();
      for (let x = 0; x <= 10; x += 0.1) {
        x === 0 ? ctx.moveTo(toX(x), toY(fn(x))) : ctx.lineTo(toX(x), toY(fn(x)));
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = "bold 20px 'JetBrains Mono'";
      ctx.textAlign = "left";
      ctx.fillText(label, toX(labelX) + 8, toY(fn(labelX)) - 10);
    };

    drawCurve(bias, "#3B82F6", "Bias²", 1);
    drawCurve(variance, "#EF4444", "Variance", 8);
    drawCurve(total, "#F59E0B", "Total Error", 6);

    // Complexity marker
    const cx = toX(complexity);
    ctx.beginPath(); ctx.moveTo(cx, toY(0)); ctx.lineTo(cx, toY(5.5));
    ctx.strokeStyle = "#F8FAFC40"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);

    // Dots on marker
    [[bias, "#3B82F6"], [variance, "#EF4444"], [total, "#F59E0B"]].forEach(([fn, c]) => {
      ctx.beginPath(); ctx.arc(cx, toY(fn(complexity)), 8, 0, Math.PI * 2);
      ctx.fillStyle = c; ctx.fill();
    });

    // Optimal zone
    const optX = 2.8;
    ctx.fillStyle = "#10B98130";
    ctx.fillRect(toX(optX - 0.5), toY(5.5), toX(optX + 0.5) - toX(optX - 0.5), toY(0) - toY(5.5));
    ctx.fillStyle = "#10B981";
    ctx.font = "16px 'JetBrains Mono'";
    ctx.textAlign = "center";
    ctx.fillText("Sweet Spot", toX(optX), toY(5.2));

    // Labels
    ctx.fillStyle = "#64748B";
    ctx.font = "16px 'JetBrains Mono'";
    ctx.textAlign = "center";
    ctx.fillText("Simple ← Model Complexity → Complex", W / 2, H - 6);
  }, [complexity]);

  return (
    <>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4, fontFamily: "var(--ds-sans), sans-serif" }}>Bias–variance tradeoff</div>
      <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 16, lineHeight: 1.55 }}>Drag complexity — the landing page promises reasoning, not memorization; this is the core tension behind that.</div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 250, borderRadius: 12, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }} />
      <label style={{ display: "block", marginTop: 16 }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>
          Model complexity: {complexity.toFixed(1)} — {complexity < 3 ? "Underfitting (high bias)" : complexity > 6 ? "Overfitting (high variance)" : "Good balance"}
        </div>
        <input type="range" min={0.5} max={9.5} step={0.1} value={complexity} onChange={e => setComplexity(+e.target.value)} style={{ width: "100%", accentColor: DS.grn }} />
      </label>
    </>
  );
};

const VISUALIZATIONS = {
  // existing
  "st-p2": NormalDistViz,
  "dl-f4": GradientDescentViz,
  "ml-f2": BiasVarianceViz,
  "ml-f3": TrainValTestSplit,
  "st-f2": NormalDistViz,
  "sq-b2": SQLJoins,
  // Python — py-basics
  "py-b2": FStringBuilderViz,
  "py-b3": PythonMutabilityViz,
  "py-b4": DictSetOpsViz,
  "py-b5": ComprehensionBuilderViz,
  // Python — py-control
  "py-c2": IteratorStepViz,
  // Python — py-oop
  "py-o1": ObjectMemoryViz,
  // Python — py-ds
  "py-d1": ArrayShapeViz,
  "py-d2": DataFrameExplorerViz,
  "py-d5": LoopVsVectorViz,
};

/** When a lesson is marked hasViz but has no bespoke component, show a course-appropriate interactive. */
function resolveLessonVizComponent(lessonId, courseId, hasViz) {
  const direct = VISUALIZATIONS[lessonId];
  if (direct) return direct;
  if (!hasViz) return null;
  if (courseId === "statistics") return NormalDistViz;
  if (courseId === "ml") return BiasVarianceViz;
  if (courseId === "deep-learning") return GradientDescentViz;
  if (courseId === "sql") return SQLJoins;
  if (courseId === "python") return PythonMutabilityViz;
  return null;
}

// ─── AI CHATBOT COMPONENT ────────────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function DataSparkPlatform() {
  const [view, setView] = useState("home");
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [chatbotCourse, setChatbotCourse] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [progress, setProgress] = useState({});
  const [courseTab, setCourseTab] = useState("learn");
  const [diffFilter, setDiffFilter] = useState("All");

  const totalLessons = CURRICULUM.reduce((a, c) => a + c.topics.reduce((b, t) => b + t.lessons.length, 0), 0);
  const totalQuestions = CURRICULUM.reduce((a, c) => a + c.questions.length, 0);
  const completedLessons = Object.keys(progress).filter(k => progress[k] === "done").length;

  const diffBadge = (d) => {
    const c = { Easy: DS.grn, Medium: "#F59E0B", Hard: "#EF4444" };
    return <span style={{ background: `${c[d]}18`, color: c[d], padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: `1px solid ${c[d]}35`, fontFamily: "var(--ds-mono), monospace" }}>{d}</span>;
  };

  // ─── HOME VIEW ─────────────────────────────────────────────────────────────
  const renderHome = () => (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
      <div style={{ textAlign: "center", padding: "48px 0 40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <PlatformLogo />
          <span style={{
            fontSize: "clamp(32px, 6vw, 44px)",
            fontWeight: 800,
            fontFamily: "var(--ds-sans), sans-serif",
            letterSpacing: "-0.03em",
            background: `linear-gradient(135deg, ${DS.t1} 0%, ${DS.t3} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          >
            DataSpark
          </span>
        </div>
        <p style={{
          color: DS.t2,
          fontSize: "clamp(15px, 2.2vw, 17px)",
          maxWidth: 520,
          margin: "0 auto",
          lineHeight: 1.65,
          fontFamily: "var(--ds-sans), sans-serif",
          fontWeight: 400,
        }}
        >
          Same promise as the landing page: <span style={{ color: DS.ind }}>systems thinking</span>
          {" "}over syntax drills. Learn visually, practice with context, and use the tutor when you are stuck.
        </p>
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "clamp(20px, 5vw, 40px)",
          marginTop: 28,
          padding: "20px 16px",
          borderTop: `1px solid ${DS.border}`,
          borderBottom: `1px solid ${DS.border}`,
        }}
        >
          {[{ n: CURRICULUM.length, l: "Courses" }, { n: totalLessons, l: "Lessons" }, { n: totalQuestions, l: "Practice Qs" }, { n: completedLessons, l: "Completed" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif" }}>{s.n}</div>
              <div style={{ fontSize: 10, color: DS.dim, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--ds-mono), monospace" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, paddingBottom: 72 }}>
        {CURRICULUM.map((course) => {
          const lessonCount = course.topics.reduce((a, t) => a + t.lessons.length, 0);
          const doneCount = course.topics.reduce((a, t) => a + t.lessons.filter(l => progress[l.id] === "done").length, 0);
          const pct = lessonCount > 0 ? Math.round((doneCount / lessonCount) * 100) : 0;

          return (
            <div
              key={course.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveCourse(course); setView("course"); setCourseTab("learn"); } }}
              onClick={() => { setActiveCourse(course); setView("course"); setCourseTab("learn"); }}
              style={{
                ...dsGlassCard({ cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s" }),
                padding: "22px 20px",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${course.color}40`;
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `${DS.shadowCard}, 0 0 40px ${course.color}12`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = DS.border;
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = DS.shadowCard;
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${course.color}, ${DS.ind}40, transparent)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>{course.icon}</span>
                <span style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>{lessonCount} lessons · {course.questions.length} Qs</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 8 }}>{course.title}</div>
              <div style={{ fontSize: 13, color: DS.t3, lineHeight: 1.55, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 14, minHeight: 44 }}>{course.description}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {course.topics.slice(0, 3).map(t => (
                  <span key={t.id} style={{ fontSize: 9, padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.t3, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>{t.title}</span>
                ))}
                {course.topics.length > 3 && <span style={{ fontSize: 9, padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.dim, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>+{course.topics.length - 3}</span>}
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 4, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${course.color}, ${course.accent})`, borderRadius: 6, transition: "width 0.4s" }} />
              </div>
              <div style={{ fontSize: 10, color: DS.dim, marginTop: 6, fontFamily: "var(--ds-mono), monospace" }}>{pct}% complete</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── COURSE VIEW ───────────────────────────────────────────────────────────
  const renderCourse = () => {
    if (!activeCourse) return null;
    const c = activeCourse;

    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        <button type="button" onClick={() => setView("home")} style={{ background: "none", border: "none", color: DS.t3, fontSize: 12, cursor: "pointer", padding: "20px 0 8px", fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>← All courses</button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <span style={{ fontSize: 36 }}>{c.icon}</span>
          <div>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: DS.t1, margin: 0, letterSpacing: "-0.02em" }}>{c.title}</h1>
            <p style={{ fontSize: 14, color: DS.t3, margin: "6px 0 0", fontWeight: 400, lineHeight: 1.55, maxWidth: 640 }}>{c.description}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${DS.border}`, margin: "20px 0 24px", flexWrap: "wrap", alignItems: "center" }}>
          {[{ id: "learn", label: `Learn (${c.topics.reduce((a, t) => a + t.lessons.length, 0)} lessons)` }, { id: "practice", label: `Practice (${c.questions.length} questions)` }].map(tab => (
            <button key={tab.id} type="button" onClick={() => setCourseTab(tab.id)} style={{
              background: "none", border: "none", borderBottom: courseTab === tab.id ? `2px solid ${c.color}` : "2px solid transparent",
              padding: "10px 18px", color: courseTab === tab.id ? DS.t1 : DS.dim, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif",
            }}>{tab.label}</button>
          ))}
          <button type="button" onClick={() => setChatbotCourse(c)} style={{
            marginLeft: "auto", background: `${c.color}18`, border: `1px solid ${c.color}35`, borderRadius: DS.radiusSm,
            padding: "8px 14px", color: c.accent, fontSize: 12, cursor: "pointer", fontFamily: "var(--ds-mono), monospace", fontWeight: 600, marginBottom: 8, boxShadow: DS.shadowCta,
          }}>
            Ask AI tutor
          </button>
        </div>

        {courseTab === "learn" && (
          <div>
            {c.topics.map(topic => (
              <div key={topic.id} style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: c.accent, fontFamily: "var(--ds-mono), monospace", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${c.color}22`, letterSpacing: "0.14em", textTransform: "uppercase" }}>{topic.title}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {topic.lessons.map((lesson, li) => {
                    const isDone = progress[lesson.id] === "done";
                    return (
                      <div
                        key={lesson.id}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveLesson(lesson); setView("lesson"); } }}
                        onClick={() => { setActiveLesson(lesson); setView("lesson"); }}
                        style={{
                          ...dsGlassCard({ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s, box-shadow 0.2s" }),
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${c.color}40`; e.currentTarget.style.boxShadow = `${DS.shadowCard}, 0 0 24px ${c.color}10`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.boxShadow = DS.shadowCard; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: isDone ? `${DS.grn}18` : "rgba(255,255,255,0.04)",
                            border: `2px solid ${isDone ? DS.grn : DS.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, color: isDone ? DS.grn : DS.dim, fontWeight: 700, fontFamily: "var(--ds-mono), monospace",
                          }}>
                            {isDone ? "✓" : li + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: DS.t1 }}>{lesson.title}</div>
                            <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginTop: 2 }}>{lesson.duration}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {lesson.hasViz && <span style={{ fontSize: 9, padding: "4px 8px", borderRadius: 6, background: `${c.color}18`, color: c.accent, fontFamily: "var(--ds-mono), monospace", fontWeight: 600, border: `1px solid ${c.color}30` }}>Interactive</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {courseTab === "practice" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["All", "Easy", "Medium", "Hard"].map(d => (
                <button key={d} type="button" onClick={() => setDiffFilter(d)} style={{
                  background: diffFilter === d ? "rgba(99,102,241,0.12)" : "transparent", border: `1px solid ${diffFilter === d ? `${c.color}35` : DS.border}`,
                  borderRadius: 8, padding: "6px 12px", color: diffFilter === d ? DS.t1 : DS.dim, fontSize: 11, cursor: "pointer", fontFamily: "var(--ds-mono), monospace", fontWeight: 600,
                }}>{d}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {c.questions.filter(q => diffFilter === "All" || q.difficulty === diffFilter).map(q => (
                <div
                  key={q.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveQuestion(q); setUserAnswer(""); setSubmitted(false); setShowModel(false); setView("question"); } }}
                  onClick={() => { setActiveQuestion(q); setUserAnswer(""); setSubmitted(false); setShowModel(false); setView("question"); }}
                  style={{
                    ...dsGlassCard({ padding: "16px 18px", cursor: "pointer", transition: "border-color 0.2s" }),
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${c.color}38`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = DS.border; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: DS.t1, marginBottom: 6 }}>{q.title}</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {q.tags.map(t => <span key={t} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.t3, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>{t}</span>)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{q.type === "code" ? "Coding" : "Open-ended"}</span>
                      {diffBadge(q.difficulty)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── LESSON VIEW ───────────────────────────────────────────────────────────
  const renderLesson = () => {
    if (!activeLesson || !activeCourse) return null;
    const VizComponent = resolveLessonVizComponent(
      activeLesson.id,
      activeCourse.id,
      activeLesson.hasViz,
    );

    return (
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        <button type="button" onClick={() => setView("course")} style={{ background: "none", border: "none", color: DS.t3, fontSize: 12, cursor: "pointer", padding: "20px 0 8px", fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>← Back to {activeCourse.title}</button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: activeCourse.accent, fontFamily: "var(--ds-mono), monospace", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>{activeCourse.title} · {activeLesson.duration}</div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: DS.t1, margin: 0, letterSpacing: "-0.02em" }}>{activeLesson.title}</h1>
        </div>

        {/* Visualization */}
        {VizComponent && (
          <div style={{ marginBottom: 28 }}>
            <VizLabShell accent={activeCourse.accent} accentSoft={`${activeCourse.color}14`}>
              <VizComponent />
            </VizLabShell>
          </div>
        )}

        {!VizComponent && activeLesson.hasViz && (
          <div style={{
            ...dsGlassCard(),
            border: `1px dashed ${activeCourse.color}35`,
            padding: "36px 28px",
            textAlign: "center",
            marginBottom: 28,
          }}>
            <div style={{ fontSize: 10, color: activeCourse.accent, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: 1.4, marginBottom: 10 }}>INTERACTIVE LAB · COMING SOON</div>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.85 }}>◇</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 6 }}>Visualization in production</div>
            <div style={{ fontSize: 13, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, maxWidth: 400, margin: "0 auto" }}>We are shipping more interactive diagrams for this topic. Use the AI tutor below to explore the concept now.</div>
          </div>
        )}

        {/* ── Concept Cards ── */}
        {activeLesson.concepts?.length > 0 && activeLesson.concepts.map((concept, ci) => (
          <div key={ci} style={{ ...dsGlassCard({ padding: "22px 24px", marginBottom: 16 }) }}>
            <div style={{ fontSize: 10, color: activeCourse.accent, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 10 }}>
              CONCEPT {ci + 1} OF {activeLesson.concepts.length}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: DS.t1, margin: "0 0 10px", fontFamily: "var(--ds-sans), sans-serif" }}>
              {concept.heading}
            </h3>
            <p style={{ fontSize: 14, color: DS.t2, lineHeight: 1.72, margin: "0 0 14px", fontFamily: "var(--ds-sans), sans-serif" }}>
              {concept.body}
            </p>
            {concept.code && (
              <pre style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${DS.border}`,
                borderRadius: 10,
                padding: "14px 16px",
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 12,
                lineHeight: 1.65,
                color: DS.t2,
                overflowX: "auto",
                margin: "0 0 14px",
                whiteSpace: "pre",
              }}>{concept.code}</pre>
            )}
            {concept.dsNote && (
              <div style={{
                background: `${activeCourse.color}0d`,
                border: `1px solid ${activeCourse.color}30`,
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                color: activeCourse.accent,
                fontFamily: "var(--ds-mono), monospace",
                lineHeight: 1.6,
              }}>
                <span style={{ fontWeight: 700, marginRight: 6 }}>◈ DS NOTE:</span>{concept.dsNote}
              </div>
            )}
          </div>
        ))}

        {/* Fallback for courses without enriched content yet */}
        {(!activeLesson.concepts || activeLesson.concepts.length === 0) && (
          <div style={{ ...dsGlassCard({ padding: "26px 24px", marginBottom: 24 }) }}>
            <div style={{ fontSize: 10, color: DS.ind, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 12 }}>LESSON OVERVIEW</div>
            <div style={{ fontSize: 15, color: DS.t2, lineHeight: 1.75 }}>
              <p style={{ marginBottom: 16 }}>This lesson covers <strong style={{ color: DS.t1 }}>{activeLesson.title}</strong> in depth.</p>
              <p>After completing this lesson, test your understanding in the <strong style={{ color: DS.t1 }}>Practice</strong> tab or ask the <strong style={{ color: DS.t1 }}>AI tutor</strong>.</p>
            </div>
          </div>
        )}

        {/* ── Key Takeaways ── */}
        {activeLesson.takeaways?.length > 0 && (
          <div style={{ ...dsGlassCard({ padding: "20px 24px", marginBottom: 24 }) }}>
            <div style={{ fontSize: 10, color: DS.grn, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 12 }}>
              KEY TAKEAWAYS
            </div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
              {activeLesson.takeaways.map((t, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < activeLesson.takeaways.length - 1 ? 10 : 0 }}>
                  <span style={{ color: DS.grn, fontWeight: 700, fontSize: 14, lineHeight: 1.5, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: DS.t2, lineHeight: 1.6, fontFamily: "var(--ds-sans), sans-serif" }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Interviewer's Lens ── */}
        {activeLesson.interviewInsights?.length > 0 && (() => {
          const [openIdx, setOpenIdx] = useState(null);
          return (
            <div style={{ ...dsGlassCard({ padding: "20px 24px", marginBottom: 24 }), borderTop: `2px solid ${activeCourse.color}60` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 16 }}>🎯</span>
                <div style={{ fontSize: 10, color: activeCourse.accent, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em" }}>INTERVIEWER'S LENS</div>
                <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>— questions they will actually ask</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeLesson.interviewInsights.map((item, i) => (
                  <div key={i}>
                    <button type="button"
                      onClick={() => setOpenIdx(openIdx === i ? null : i)}
                      style={{ background: openIdx === i ? `${activeCourse.color}12` : "rgba(255,255,255,0.03)", border: `1px solid ${openIdx === i ? activeCourse.color + "40" : DS.border}`, borderRadius: 8, padding: "10px 14px", width: "100%", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif" }}>"{item.q}"</span>
                      <span style={{ color: DS.t3, fontFamily: "var(--ds-mono), monospace", fontSize: 12 }}>{openIdx === i ? "▲" : "▼"}</span>
                    </button>
                    {openIdx === i && (
                      <div style={{ padding: "12px 14px", background: `${activeCourse.color}08`, borderRadius: "0 0 8px 8px", border: `1px solid ${activeCourse.color}20`, borderTop: "none" }}>
                        <p style={{ margin: "0 0 10px", fontSize: 13, color: DS.t2, lineHeight: 1.7, fontFamily: "var(--ds-sans), sans-serif" }}>{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Scenario Knowledge Check ── */}
        {activeLesson.scenario && (() => {
          const [showAnswer, setShowAnswer] = useState(false);
          return (
            <div style={{ ...dsGlassCard({ padding: "20px 24px", marginBottom: 24 }), borderTop: `2px solid rgba(52,211,153,0.4)` }}>
              <div style={{ fontSize: 10, color: DS.grn, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 12 }}>
                SCENARIO · THINK BEFORE REVEALING
              </div>
              <p style={{ fontSize: 14, color: DS.t1, lineHeight: 1.75, margin: "0 0 16px", fontFamily: "var(--ds-sans), sans-serif", fontWeight: 500 }}>
                {activeLesson.scenario.prompt}
              </p>
              {!showAnswer ? (
                <button type="button" onClick={() => setShowAnswer(true)}
                  style={{ background: "rgba(52,211,153,0.1)", border: `1px solid rgba(52,211,153,0.3)`, borderRadius: DS.radiusSm, padding: "10px 20px", color: DS.grn, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif" }}>
                  Reveal answer →
                </button>
              ) : (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: DS.grn, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>ANSWER</div>
                    <p style={{ fontSize: 13, color: DS.t2, lineHeight: 1.7, margin: 0, fontFamily: "var(--ds-sans), sans-serif" }}>{activeLesson.scenario.answer}</p>
                  </div>
                  <div style={{ background: "rgba(129,140,248,0.08)", border: `1px solid rgba(129,140,248,0.2)`, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: DS.ind, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>SENIOR INTUITION</div>
                    <p style={{ fontSize: 13, color: DS.t2, lineHeight: 1.7, margin: 0, fontFamily: "var(--ds-sans), sans-serif" }}>{activeLesson.scenario.seniorInsight}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Linked Practice Question ── */}
        {(() => {
          const q = activeLesson.linkedQuestionId
            ? ALL_QUESTIONS.find(x => x.id === activeLesson.linkedQuestionId)
            : null;
          if (!q) return null;
          const diffColor = { Easy: DS.grn, Medium: "#F59E0B", Hard: "#EF4444" }[q.difficulty] || DS.t3;
          return (
            <div style={{ ...dsGlassCard({ padding: "20px 24px", marginBottom: 24 }), border: `1px solid ${activeCourse.color}30` }}>
              <div style={{ fontSize: 10, color: activeCourse.accent, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 12 }}>
                LESSON CHALLENGE
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif" }}>{q.title}</span>
                <span style={{ background: `${diffColor}18`, color: diffColor, padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, border: `1px solid ${diffColor}35`, fontFamily: "var(--ds-mono), monospace" }}>{q.difficulty}</span>
                <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{q.company} · {q.estimatedMinutes}m</span>
              </div>
              <p style={{ fontSize: 13, color: DS.t3, lineHeight: 1.65, margin: "0 0 14px", fontFamily: "var(--ds-sans), sans-serif" }}>
                {q.prompt.slice(0, 180)}{q.prompt.length > 180 ? "…" : ""}
              </p>
              <button
                type="button"
                onClick={() => { setActiveQuestion(q); setUserAnswer(""); setSubmitted(false); setShowModel(false); setView("question"); }}
                style={{ background: DS.indB, border: "none", borderRadius: DS.radiusSm, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif", boxShadow: DS.shadowCta }}
              >
                Attempt this question →
              </button>
            </div>
          );
        })()}

        <div style={{ display: "flex", gap: 10, marginBottom: 40, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => { setProgress(p => ({ ...p, [activeLesson.id]: "done" })); setView("course"); }}
            style={{
              flex: 1, minWidth: 200, background: DS.indB, border: "none", borderRadius: DS.radiusSm, padding: "14px 0", color: "#fff", fontSize: 14,
              fontWeight: 700, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif", boxShadow: DS.shadowCta,
            }}>
            Mark complete & continue →
          </button>
          <button
            type="button"
            onClick={() => setChatbotCourse(activeCourse)}
            style={{
              background: "rgba(255,255,255,0.04)", border: `1px solid ${DS.border}`, borderRadius: DS.radiusSm, padding: "14px 22px",
              color: DS.t1, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif",
            }}>
            Ask tutor
          </button>
        </div>
      </div>
    );
  };

  // ─── QUESTION VIEW ─────────────────────────────────────────────────────────
  const renderQuestion = () => {
    if (!activeQuestion || !activeCourse) return null;
    const q = activeQuestion;

    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        <button type="button" onClick={() => { setCourseTab("practice"); setView("course"); }} style={{ background: "none", border: "none", color: DS.t3, fontSize: 12, cursor: "pointer", padding: "20px 0 8px", fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>← Back to practice</button>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            {diffBadge(q.difficulty)}
            <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{q.type === "code" ? "Coding problem" : "Open-ended case study"}</span>
          </div>
          <h1 style={{ fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 800, color: DS.t1, margin: 0, letterSpacing: "-0.02em" }}>{q.title}</h1>
          <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
            {q.tags.map(t => <span key={t} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: DS.t3, fontFamily: "var(--ds-mono), monospace", border: `1px solid ${DS.border}` }}>{t}</span>)}
          </div>
        </div>

        <div style={{
          ...dsGlassCard({ padding: "22px 24px", marginBottom: 20, fontSize: 14, color: DS.t2, lineHeight: 1.75, whiteSpace: "pre-wrap" }),
        }}>
          {q.prompt}
        </div>

        <textarea
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          placeholder={q.type === "code" ? "Write your code here..." : "Write your answer — explain your reasoning, tradeoffs, and approach..."}
          disabled={submitted}
          style={{
            width: "100%", minHeight: 280, background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusMd, padding: 18, color: DS.t1, fontSize: 14, resize: "vertical",
            fontFamily: q.type === "code" ? "var(--ds-mono), monospace" : "var(--ds-sans), sans-serif",
            lineHeight: 1.7, outline: "none", boxSizing: "border-box", opacity: submitted ? 0.6 : 1,
          }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 16, marginBottom: 20, flexWrap: "wrap" }}>
          {!submitted && (
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={!userAnswer.trim()}
              style={{
                flex: 1, minWidth: 160, background: userAnswer.trim() ? DS.indB : "rgba(255,255,255,0.06)",
                border: "none", borderRadius: DS.radiusSm, padding: "14px 0", color: userAnswer.trim() ? "#fff" : DS.dim,
                fontSize: 14, fontWeight: 700, cursor: userAnswer.trim() ? "pointer" : "not-allowed", fontFamily: "var(--ds-sans), sans-serif",
                boxShadow: userAnswer.trim() ? DS.shadowCta : "none",
              }}>
              Submit answer
            </button>
          )}
          {submitted && !showModel && (
            <button
              type="button"
              onClick={() => setShowModel(true)}
              style={{
                flex: 1, minWidth: 200, background: DS.grn, border: "none", borderRadius: DS.radiusSm, padding: "14px 0",
                color: "#020617", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif",
              }}>
              Show model answer & rubric
            </button>
          )}
          <button
            type="button"
            onClick={() => setChatbotCourse(activeCourse)}
            style={{
              background: "rgba(255,255,255,0.04)", border: `1px solid ${DS.border}`, borderRadius: DS.radiusSm, padding: "14px 20px",
              color: DS.t1, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif",
            }}>
            Get help
          </button>
        </div>

        {showModel && (
          <div style={{
            ...dsGlassCard({ padding: "22px 24px", marginBottom: 40, border: `1px solid rgba(52,211,153,0.25)` }),
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DS.grn, fontFamily: "var(--ds-mono), monospace", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Model answer & evaluation criteria
            </div>
            <div style={{ fontSize: 14, color: DS.t3, lineHeight: 1.7, fontWeight: 400 }}>
              <p style={{ marginBottom: 12 }}>A strong answer to this question would demonstrate clear understanding of the core concepts, structured reasoning about tradeoffs, and practical awareness of real-world constraints.</p>
              <p style={{ marginBottom: 12 }}>The AI evaluator scores your response against the rubric below — compare your answer point-by-point to identify gaps.</p>
              <p style={{ color: DS.dim, fontSize: 13, fontStyle: "italic" }}>Full model answers with detailed rubric scoring are available in the complete platform. Use the AI tutor to discuss your specific answer and get personalized feedback.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: DS.bg, color: DS.t1, fontFamily: "var(--ds-sans), system-ui, sans-serif", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root { --ds-sans: 'Manrope', system-ui, sans-serif; --ds-mono: 'JetBrains Mono', monospace; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        ::selection { background: rgba(99,102,241,.25); color: #fff; }
        textarea:focus-visible, input:focus-visible, button:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,.35); border-color: ${DS.indB} !important; }
        textarea:focus, input:focus { border-color: ${DS.indB} !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 3px; }
        input[type="range"] { height: 4px; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 720, height: 720, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 68%)", top: "-18%", left: "-10%" }} />
        <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)", bottom: "0%", right: "-8%" }} />
      </div>

      <nav style={{
        borderBottom: `1px solid ${DS.border}`,
        padding: "12px clamp(16px, 3vw, 28px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        position: "sticky",
        top: 0,
        background: "rgba(2,6,23,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 100,
      }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            onClick={() => { setView("home"); setActiveCourse(null); }}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}
          >
            <PlatformLogo />
            <span style={{ fontSize: 17, fontWeight: 800, color: DS.t1, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>DataSpark</span>
          </div>
          <Link
            to="/"
            style={{
              fontSize: 11,
              color: DS.t3,
              textDecoration: "none",
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 600,
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              flexShrink: 0,
            }}
          >
            Landing
          </Link>
        </div>

        <div style={{ display: "flex", gap: 4, overflowX: "auto", maxWidth: "min(68vw, 520px)", paddingBottom: 2 }}>
          {CURRICULUM.slice(0, 6).map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setActiveCourse(c); setView("course"); setCourseTab("learn"); }}
              style={{
                background: activeCourse?.id === c.id ? "rgba(99,102,241,0.12)" : "transparent",
                border: `1px solid ${activeCourse?.id === c.id ? `${c.color}35` : "transparent"}`,
                borderRadius: 8,
                padding: "6px 10px",
                color: activeCourse?.id === c.id ? DS.t1 : DS.dim,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "var(--ds-mono), monospace",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {c.icon} {c.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ paddingBottom: 72, position: "relative", zIndex: 1 }}>
        {view === "home" && renderHome()}
        {view === "course" && renderCourse()}
        {view === "lesson" && renderLesson()}
        {view === "question" && renderQuestion()}
      </main>

      {chatbotCourse && <AIChatbot course={chatbotCourse} onClose={() => setChatbotCourse(null)} />}
    </div>
  );
}
