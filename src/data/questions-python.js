// AGENT: curriculum-agent
// COURSE: Python Fundamentals
// STATUS: Complete — 41 questions
// REVIEWED: Pending review-agent

export const PYTHON_QUESTIONS = [
  // ═══ CORE SYNTAX & DATA TYPES (8 questions) ═══
  {
    id: "py-q01", courseId: "python", topicId: "py-basics",
    title: "Type-Safe Config Parser",
    difficulty: "Easy", company: "Stripe", type: "code", language: "python", estimatedMinutes: 12,
    prompt: `You're building a config system for a data pipeline. Write a function \`parse_config(raw: dict) -> dict\` that takes a raw config dictionary and:\n\n1. Validates that required keys exist: 'source_db', 'target_table', 'batch_size', 'retry_count'\n2. Coerces types: batch_size and retry_count must be positive integers\n3. Sets defaults: retry_count defaults to 3 if missing, batch_size defaults to 1000\n4. Returns a clean typed dict\n5. Raises ValueError with a descriptive message for invalid configs\n\nHandle edge cases: string numbers ("100"), negative values, missing keys, None values.`,
    hints: [
      "isinstance() checks type, but also handle strings that could be int('100')",
      "Use dict.get(key, default) for optional fields with defaults",
      "Collect all errors before raising — don't fail on the first one"
    ],
    modelAnswer: `def parse_config(raw: dict) -> dict:
    errors = []
    required = ['source_db', 'target_table']
    
    for key in required:
        if key not in raw or raw[key] is None:
            errors.append(f"Missing required key: '{key}'")
    
    def to_positive_int(value, name, default=None):
        if value is None:
            if default is not None:
                return default
            errors.append(f"'{name}' is required")
            return None
        try:
            n = int(value)
            if n <= 0:
                errors.append(f"'{name}' must be positive, got {n}")
                return None
            return n
        except (ValueError, TypeError):
            errors.append(f"'{name}' must be an integer, got {type(value).__name__}: {value}")
            return None
    
    batch_size = to_positive_int(raw.get('batch_size'), 'batch_size', default=1000)
    retry_count = to_positive_int(raw.get('retry_count'), 'retry_count', default=3)
    
    if errors:
        raise ValueError("Config validation failed:\\n" + "\\n".join(f"  - {e}" for e in errors))
    
    return {
        'source_db': str(raw['source_db']),
        'target_table': str(raw['target_table']),
        'batch_size': batch_size,
        'retry_count': retry_count,
    }`,
    rubric: ["Validates required keys", "Handles type coercion (str→int)", "Rejects negative values", "Provides defaults for optional fields", "Collects all errors before raising", "Descriptive error messages"],
    tags: ["validation", "type-coercion", "error-handling", "config"],
    commonMistakes: ["Failing on first error instead of collecting all", "Not handling string numbers like '100'", "Forgetting None checks"]
  },
  {
    id: "py-q02", courseId: "python", topicId: "py-basics",
    title: "Nested Dict Flattener",
    difficulty: "Medium", company: "Airbnb", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `Data from your API comes as deeply nested JSON. Write a function \`flatten_dict(d: dict, sep: str = '.') -> dict\` that flattens any nested dictionary into a single-level dict with compound keys.\n\nExamples:\n  {'a': {'b': 1, 'c': {'d': 2}}} → {'a.b': 1, 'a.c.d': 2}\n  {'user': {'name': 'Alice', 'address': {'city': 'NYC'}}} → {'user.name': 'Alice', 'user.address.city': 'NYC'}\n\nHandle: empty dicts (skip them), lists (keep as-is), None values, custom separator.`,
    hints: [
      "Recursion is natural here — base case is when value is not a dict",
      "Build the prefix string as you recurse deeper",
      "An iterative approach with a stack works too"
    ],
    modelAnswer: `def flatten_dict(d: dict, sep: str = '.', prefix: str = '') -> dict:
    result = {}
    for key, value in d.items():
        new_key = f"{prefix}{sep}{key}" if prefix else key
        if isinstance(value, dict) and value:  # non-empty dict
            result.update(flatten_dict(value, sep, new_key))
        else:
            result[new_key] = value
    return result`,
    rubric: ["Correct recursive flattening", "Handles arbitrary nesting depth", "Custom separator support", "Skips empty dicts", "Preserves non-dict values (lists, None)", "Clean key concatenation"],
    tags: ["recursion", "dictionaries", "data-transformation", "JSON"],
    commonMistakes: ["Not handling empty dicts", "Mutating the input dict", "Extra separator at the start of keys"]
  },
  {
    id: "py-q03", courseId: "python", topicId: "py-basics",
    title: "Custom Counter Implementation",
    difficulty: "Easy", company: "Google", type: "code", language: "python", estimatedMinutes: 10,
    prompt: `Without using collections.Counter, implement a function \`count_elements(items: list) -> dict\` that returns a dictionary mapping each unique element to its count. Then add a function \`top_n(counts: dict, n: int) -> list\` that returns the top N elements by count as a list of (element, count) tuples, sorted descending.`,
    hints: [
      "dict.get(key, 0) + 1 is the classic counting pattern",
      "sorted() with a key function and reverse=True for top-N",
      "Slicing [:n] after sorting gives you the top N"
    ],
    modelAnswer: `def count_elements(items: list) -> dict:
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    return counts

def top_n(counts: dict, n: int) -> list:
    return sorted(counts.items(), key=lambda x: x[1], reverse=True)[:n]`,
    rubric: ["Correct counting logic", "No use of Counter", "top_n sorts by count descending", "Returns correct tuple format", "Handles ties gracefully"],
    tags: ["dictionaries", "sorting", "fundamentals"],
    commonMistakes: ["Using Counter when asked not to", "Sorting by key instead of value", "Not handling empty input"]
  },
  {
    id: "py-q04", courseId: "python", topicId: "py-basics",
    title: "Matrix Operations Without NumPy",
    difficulty: "Hard", company: "Jane Street", type: "code", language: "python", estimatedMinutes: 25,
    prompt: `Implement basic matrix operations using only Python lists:\n\n1. \`matrix_multiply(A, B)\` — standard matrix multiplication\n2. \`transpose(A)\` — swap rows and columns\n3. \`determinant(A)\` — calculate determinant (for 2x2 and 3x3 matrices)\n\nValidate dimensions and raise ValueError for incompatible matrices. Use type hints.`,
    hints: [
      "Matrix multiply: C[i][j] = sum(A[i][k] * B[k][j] for k in range(cols_A))",
      "Transpose: swap indices — result[j][i] = original[i][j]",
      "3x3 determinant: use cofactor expansion along the first row"
    ],
    modelAnswer: `from typing import List

Matrix = List[List[float]]

def matrix_multiply(A: Matrix, B: Matrix) -> Matrix:
    if not A or not B:
        raise ValueError("Empty matrix")
    if len(A[0]) != len(B):
        raise ValueError(f"Incompatible dimensions: {len(A)}x{len(A[0])} and {len(B)}x{len(B[0])}")
    rows_a, cols_a, cols_b = len(A), len(A[0]), len(B[0])
    return [[sum(A[i][k] * B[k][j] for k in range(cols_a)) for j in range(cols_b)] for i in range(rows_a)]

def transpose(A: Matrix) -> Matrix:
    if not A:
        return []
    return [[A[i][j] for i in range(len(A))] for j in range(len(A[0]))]

def determinant(A: Matrix) -> float:
    n = len(A)
    if any(len(row) != n for row in A):
        raise ValueError("Matrix must be square")
    if n == 1:
        return A[0][0]
    if n == 2:
        return A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if n == 3:
        return (A[0][0] * (A[1][1]*A[2][2] - A[1][2]*A[2][1])
              - A[0][1] * (A[1][0]*A[2][2] - A[1][2]*A[2][0])
              + A[0][2] * (A[1][0]*A[2][1] - A[1][1]*A[2][0]))
    raise ValueError(f"Determinant only supported for n<=3, got {n}")`,
    rubric: ["Correct matrix multiplication", "Dimension validation", "Transpose works for non-square matrices", "2x2 determinant correct", "3x3 determinant via cofactor expansion", "Type hints used", "Edge cases handled"],
    tags: ["linear-algebra", "algorithms", "lists", "math"],
    commonMistakes: ["Wrong index order in multiplication", "Not validating dimensions", "Forgetting non-square transpose"]
  },
  {
    id: "py-q05", courseId: "python", topicId: "py-basics",
    title: "Smart List Deduplication",
    difficulty: "Easy", company: "Spotify", type: "code", language: "python", estimatedMinutes: 8,
    prompt: `Write three versions of a dedup function:\n1. \`dedup_preserve_order(lst)\` — remove duplicates, keep first occurrence order\n2. \`dedup_by_key(lst, key_fn)\` — deduplicate dicts by a key function\n3. \`dedup_case_insensitive(strings)\` — deduplicate strings ignoring case, keep original casing\n\nExample for #2: dedup_by_key([{'id': 1, 'name': 'A'}, {'id': 1, 'name': 'B'}], lambda x: x['id']) → [{'id': 1, 'name': 'A'}]`,
    hints: [
      "A set for 'seen' items tracks what you've already encountered",
      "For key-based dedup, track seen keys not seen items",
      "For case-insensitive, track .lower() versions but return originals"
    ],
    modelAnswer: `def dedup_preserve_order(lst):
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

def dedup_by_key(lst, key_fn):
    seen = set()
    result = []
    for item in lst:
        k = key_fn(item)
        if k not in seen:
            seen.add(k)
            result.append(item)
    return result

def dedup_case_insensitive(strings):
    return dedup_by_key(strings, lambda s: s.lower())`,
    rubric: ["Preserves insertion order", "O(n) time complexity using set", "Key-based dedup works with any key function", "Case-insensitive version reuses key-based", "Keeps first occurrence"],
    tags: ["deduplication", "sets", "higher-order-functions"],
    commonMistakes: ["Using list instead of set for O(n²)", "Not preserving order", "Not keeping original casing"]
  },
  // ═══ CONTROL FLOW & FUNCTIONS (8 questions) ═══
  {
    id: "py-q06", courseId: "python", topicId: "py-control",
    title: "Retry Decorator with Exponential Backoff",
    difficulty: "Medium", company: "AWS", type: "code", language: "python", estimatedMinutes: 18,
    prompt: `Build a decorator \`@retry(max_attempts=3, backoff_factor=2, exceptions=(Exception,))\` that:\n\n1. Retries the decorated function up to max_attempts times\n2. Waits with exponential backoff between retries (1s, 2s, 4s...)\n3. Only catches specified exception types\n4. Logs each retry attempt with the exception message\n5. Raises the last exception if all retries fail\n6. Works with any function signature (*args, **kwargs)\n\nThis is used in production data pipelines to handle transient API/DB failures.`,
    hints: [
      "You need a decorator factory (function that returns a decorator that returns a wrapper)",
      "time.sleep(backoff_factor ** attempt) for exponential backoff",
      "functools.wraps preserves the original function's metadata"
    ],
    modelAnswer: `import time
import functools
import logging

logger = logging.getLogger(__name__)

def retry(max_attempts=3, backoff_factor=2, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        wait = backoff_factor ** attempt
                        logger.warning(f"Attempt {attempt+1}/{max_attempts} failed: {e}. Retrying in {wait}s...")
                        time.sleep(wait)
                    else:
                        logger.error(f"All {max_attempts} attempts failed for {func.__name__}")
            raise last_exception
        return wrapper
    return decorator`,
    rubric: ["Three-level nesting (factory → decorator → wrapper)", "Exponential backoff calculation", "Only catches specified exceptions", "Logs retry attempts", "Raises last exception on final failure", "functools.wraps used", "Works with *args/**kwargs"],
    tags: ["decorators", "error-handling", "production-patterns", "retry-logic"],
    commonMistakes: ["Missing the decorator factory level", "Catching all exceptions instead of specified ones", "Off-by-one in attempt counting"]
  },
  {
    id: "py-q07", courseId: "python", topicId: "py-control",
    title: "Generator-Based File Chunker",
    difficulty: "Medium", company: "Databricks", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `You need to process a 50GB log file. Write generators:\n\n1. \`read_chunks(filepath, chunk_size=1000)\` — yields lists of chunk_size lines at a time\n2. \`filter_lines(chunks, pattern)\` — yields only lines matching a regex pattern\n3. \`parse_log_entries(lines)\` — yields parsed dicts from log lines (format: "TIMESTAMP|LEVEL|MESSAGE")\n4. \`pipeline(filepath, pattern, chunk_size=1000)\` — chains all three together\n\nThe entire pipeline must be lazy — never load the full file into memory.`,
    hints: [
      "yield from can delegate to another generator",
      "Accumulate lines into a list until chunk_size, then yield the list",
      "re.search returns None on no match — use it as a filter condition"
    ],
    modelAnswer: `import re
from typing import Generator, Dict, List

def read_chunks(filepath: str, chunk_size: int = 1000) -> Generator[List[str], None, None]:
    chunk = []
    with open(filepath, 'r') as f:
        for line in f:
            chunk.append(line.strip())
            if len(chunk) >= chunk_size:
                yield chunk
                chunk = []
    if chunk:  # Don't forget the last partial chunk
        yield chunk

def filter_lines(chunks: Generator, pattern: str) -> Generator[str, None, None]:
    compiled = re.compile(pattern)
    for chunk in chunks:
        for line in chunk:
            if compiled.search(line):
                yield line

def parse_log_entries(lines: Generator) -> Generator[Dict, None, None]:
    for line in lines:
        parts = line.split('|', 2)  # maxsplit=2 in case MESSAGE contains |
        if len(parts) == 3:
            yield {
                'timestamp': parts[0].strip(),
                'level': parts[1].strip(),
                'message': parts[2].strip(),
            }

def pipeline(filepath: str, pattern: str, chunk_size: int = 1000) -> Generator[Dict, None, None]:
    chunks = read_chunks(filepath, chunk_size)
    filtered = filter_lines(chunks, pattern)
    parsed = parse_log_entries(filtered)
    yield from parsed`,
    rubric: ["All functions are generators (use yield)", "Chunking handles last partial chunk", "Regex is compiled once", "Log parsing handles edge cases (| in message)", "Pipeline chains lazily", "Memory-efficient (no full file load)", "Type hints present"],
    tags: ["generators", "file-processing", "memory-efficiency", "pipelines", "regex"],
    commonMistakes: ["Forgetting the last partial chunk", "Not compiling regex (performance)", "Using readlines() which loads entire file"]
  },
  {
    id: "py-q08", courseId: "python", topicId: "py-control",
    title: "Functional Data Pipeline",
    difficulty: "Easy", company: "Netflix", type: "code", language: "python", estimatedMinutes: 10,
    prompt: `Using only map, filter, and reduce (from functools), transform a list of user activity records.\n\nGiven records like: [{'user': 'alice', 'action': 'view', 'value': 10}, ...]\n\n1. Filter to only 'purchase' actions\n2. Extract the 'value' field\n3. Apply a 10% discount (multiply by 0.9)\n4. Sum the total discounted value\n\nWrite it as a single composed expression AND as a readable pipeline.`,
    hints: [
      "filter(lambda x: condition, iterable) for step 1",
      "map(lambda x: x['value'], filtered) for step 2",
      "functools.reduce(lambda a, b: a + b, values) for the sum"
    ],
    modelAnswer: `from functools import reduce

records = [
    {'user': 'alice', 'action': 'purchase', 'value': 100},
    {'user': 'bob', 'action': 'view', 'value': 50},
    {'user': 'alice', 'action': 'purchase', 'value': 200},
    {'user': 'carol', 'action': 'view', 'value': 30},
]

# Single expression
total = reduce(lambda a, b: a + b,
    map(lambda v: v * 0.9,
        map(lambda r: r['value'],
            filter(lambda r: r['action'] == 'purchase', records))))

# Readable pipeline version
def total_discounted_purchases(records):
    purchases = filter(lambda r: r['action'] == 'purchase', records)
    values = map(lambda r: r['value'], purchases)
    discounted = map(lambda v: v * 0.9, values)
    return reduce(lambda a, b: a + b, discounted, 0)  # 0 as initial for empty list

# Result: (100 + 200) * 0.9 = 270.0`,
    rubric: ["Correct use of filter", "Correct use of map for extraction", "Correct use of map for transformation", "reduce for aggregation", "Both composed and readable versions", "Handles empty list edge case"],
    tags: ["functional-programming", "map-filter-reduce", "lambda", "data-transformation"],
    commonMistakes: ["Forgetting that filter/map return iterators in Python 3", "Not providing initial value to reduce", "Wrong order of operations"]
  },
  {
    id: "py-q09", courseId: "python", topicId: "py-control",
    title: "Context Manager for DB Connections",
    difficulty: "Medium", company: "Uber", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `Write a context manager class \`DatabaseConnection\` that:\n1. Opens a (simulated) database connection on __enter__\n2. Provides a cursor-like object for queries\n3. Auto-commits on successful exit\n4. Auto-rollbacks on exception\n5. Always closes the connection on exit\n6. Logs connection open/close/commit/rollback events\n\nAlso write a @contextmanager decorator version using contextlib.`,
    hints: [
      "__enter__ returns the object to use in 'with ... as x'",
      "__exit__ receives exception info — return False to re-raise",
      "contextlib.contextmanager uses try/yield/except/finally"
    ],
    modelAnswer: `import logging
from contextlib import contextmanager

logger = logging.getLogger(__name__)

# Class-based version
class DatabaseConnection:
    def __init__(self, connection_string):
        self.connection_string = connection_string
        self.connection = None
        
    def __enter__(self):
        logger.info(f"Opening connection to {self.connection_string}")
        self.connection = {"status": "open", "queries": []}  # Simulated
        return self
    
    def execute(self, query, params=None):
        if not self.connection or self.connection["status"] != "open":
            raise RuntimeError("Not connected")
        self.connection["queries"].append((query, params))
        logger.info(f"Executed: {query}")
        return {"rows_affected": 1}  # Simulated
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            logger.warning(f"Rolling back due to {exc_type.__name__}: {exc_val}")
            # rollback
        else:
            logger.info("Committing transaction")
            # commit
        logger.info("Closing connection")
        self.connection["status"] = "closed"
        return False  # Don't suppress exceptions

# Decorator version
@contextmanager
def db_connection(connection_string):
    conn = {"status": "open", "queries": []}
    logger.info(f"Opening connection to {connection_string}")
    try:
        yield conn
        logger.info("Committing transaction")
    except Exception as e:
        logger.warning(f"Rolling back due to {e}")
        raise
    finally:
        conn["status"] = "closed"
        logger.info("Closing connection")`,
    rubric: ["__enter__ opens connection and returns self", "__exit__ handles exceptions correctly", "Auto-commit on success", "Auto-rollback on exception", "Always closes in finally/exit", "Logging present", "contextmanager version also provided"],
    tags: ["context-managers", "OOP", "database", "resource-management"],
    commonMistakes: ["Returning True in __exit__ (suppresses exceptions)", "Not closing connection on exception path", "Forgetting to yield in contextmanager version"]
  },
  {
    id: "py-q10", courseId: "python", topicId: "py-control",
    title: "Recursive Directory Walker",
    difficulty: "Easy", company: "Dropbox", type: "code", language: "python", estimatedMinutes: 10,
    prompt: `Write a function \`find_files(directory, extension=None, min_size=0)\` that:\n1. Recursively walks a directory tree\n2. Optionally filters by file extension (e.g., '.csv')\n3. Optionally filters by minimum file size in bytes\n4. Returns a list of dicts: {'path': str, 'size': int, 'modified': datetime}\n5. Sorts results by size descending\n\nUse pathlib.Path instead of os.walk.`,
    hints: [
      "Path.rglob('*') recursively finds all files",
      "Path.suffix gives the extension (e.g., '.csv')",
      "Path.stat().st_size gives file size, st_mtime gives modification time"
    ],
    modelAnswer: `from pathlib import Path
from datetime import datetime

def find_files(directory, extension=None, min_size=0):
    root = Path(directory)
    if not root.is_dir():
        raise ValueError(f"Not a directory: {directory}")
    
    pattern = f'*{extension}' if extension else '*'
    results = []
    
    for path in root.rglob(pattern):
        if not path.is_file():
            continue
        stat = path.stat()
        if stat.st_size >= min_size:
            results.append({
                'path': str(path),
                'size': stat.st_size,
                'modified': datetime.fromtimestamp(stat.st_mtime),
            })
    
    return sorted(results, key=lambda f: f['size'], reverse=True)`,
    rubric: ["Uses pathlib.Path", "Recursive traversal", "Extension filtering works", "Size filtering works", "Returns structured dicts", "Sorted by size descending", "Validates input directory"],
    tags: ["pathlib", "file-system", "recursion", "filtering"],
    commonMistakes: ["Using os.walk instead of pathlib", "Not checking is_file()", "Forgetting to handle non-existent directories"]
  },
  // ═══ OOP (7 questions) ═══
  {
    id: "py-q11", courseId: "python", topicId: "py-oop",
    title: "Data Pipeline Base Class",
    difficulty: "Medium", company: "Airflow", type: "code", language: "python", estimatedMinutes: 20,
    prompt: `Design an abstract base class \`DataPipeline\` that standardizes how your team builds pipelines:\n\n1. Abstract methods: extract(), transform(data), load(data)\n2. A concrete run() method that calls extract→transform→load with logging and timing\n3. Error handling: if any step fails, log the error and call a cleanup() method\n4. A @staticmethod validate_schema(data, schema) that checks data matches expected types\n\nThen implement a concrete \`CSVToDBPipeline\` subclass.`,
    hints: [
      "from abc import ABC, abstractmethod",
      "time.time() before and after each step for timing",
      "cleanup() should have a default implementation in the base class"
    ],
    modelAnswer: `from abc import ABC, abstractmethod
import time
import logging

logger = logging.getLogger(__name__)

class DataPipeline(ABC):
    def __init__(self, name: str):
        self.name = name
        self.metrics = {}
    
    @abstractmethod
    def extract(self):
        pass
    
    @abstractmethod
    def transform(self, data):
        pass
    
    @abstractmethod
    def load(self, data):
        pass
    
    def cleanup(self):
        logger.info(f"[{self.name}] Running default cleanup")
    
    def run(self):
        logger.info(f"[{self.name}] Pipeline started")
        overall_start = time.time()
        try:
            start = time.time()
            raw_data = self.extract()
            self.metrics['extract_seconds'] = time.time() - start
            logger.info(f"[{self.name}] Extract: {self.metrics['extract_seconds']:.2f}s")
            
            start = time.time()
            transformed = self.transform(raw_data)
            self.metrics['transform_seconds'] = time.time() - start
            logger.info(f"[{self.name}] Transform: {self.metrics['transform_seconds']:.2f}s")
            
            start = time.time()
            result = self.load(transformed)
            self.metrics['load_seconds'] = time.time() - start
            logger.info(f"[{self.name}] Load: {self.metrics['load_seconds']:.2f}s")
            
            self.metrics['total_seconds'] = time.time() - overall_start
            logger.info(f"[{self.name}] Pipeline complete: {self.metrics['total_seconds']:.2f}s")
            return result
        except Exception as e:
            logger.error(f"[{self.name}] Pipeline failed: {e}")
            self.cleanup()
            raise
    
    @staticmethod
    def validate_schema(data, schema):
        if not isinstance(data, list):
            raise ValueError("Data must be a list of dicts")
        for i, row in enumerate(data):
            for field, expected_type in schema.items():
                if field not in row:
                    raise ValueError(f"Row {i}: missing field '{field}'")
                if not isinstance(row[field], expected_type):
                    raise ValueError(f"Row {i}: '{field}' expected {expected_type.__name__}, got {type(row[field]).__name__}")


class CSVToDBPipeline(DataPipeline):
    def __init__(self, csv_path, db_table):
        super().__init__(f"CSV→{db_table}")
        self.csv_path = csv_path
        self.db_table = db_table
    
    def extract(self):
        # Simulated CSV reading
        return [{'id': 1, 'name': 'Alice', 'amount': 100.0}]
    
    def transform(self, data):
        self.validate_schema(data, {'id': int, 'name': str, 'amount': float})
        return [{'id': r['id'], 'name': r['name'].upper(), 'amount': round(r['amount'], 2)} for r in data]
    
    def load(self, data):
        logger.info(f"Inserting {len(data)} rows into {self.db_table}")
        return len(data)`,
    rubric: ["Proper ABC usage with abstract methods", "run() orchestrates ETL with logging/timing", "Error handling with cleanup", "Static validate_schema method", "Concrete subclass implements all abstracts", "Metrics collection", "Production-quality logging"],
    tags: ["OOP", "abstract-classes", "design-patterns", "ETL", "pipelines"],
    commonMistakes: ["Forgetting to call super().__init__() in subclass", "Not raising in the except block after cleanup", "Missing @abstractmethod decorator"]
  },
  {
    id: "py-q12", courseId: "python", topicId: "py-oop",
    title: "Immutable Config with __slots__",
    difficulty: "Hard", company: "Meta", type: "code", language: "python", estimatedMinutes: 20,
    prompt: `Build a configuration class that's:\n1. Immutable after creation (use __setattr__ override or frozen dataclass)\n2. Memory-efficient (use __slots__)\n3. Supports dot notation access AND dictionary-style access\n4. Can be created from a dict or keyword arguments\n5. Has a .to_dict() method\n6. Supports merging two configs (returns new config, doesn't mutate)\n7. Pretty-prints with __repr__`,
    hints: [
      "__slots__ prevents dynamic attribute creation and saves memory",
      "Override __setattr__ to raise after init for immutability",
      "__getitem__ enables config['key'] access"
    ],
    modelAnswer: `class Config:
    __slots__ = ('_data',)
    
    def __init__(self, data=None, **kwargs):
        d = {**(data or {}), **kwargs}
        object.__setattr__(self, '_data', d)
    
    def __getattr__(self, name):
        try:
            return self._data[name]
        except KeyError:
            raise AttributeError(f"Config has no attribute '{name}'")
    
    def __getitem__(self, key):
        return self._data[key]
    
    def __setattr__(self, name, value):
        raise AttributeError("Config is immutable")
    
    def __contains__(self, key):
        return key in self._data
    
    def to_dict(self):
        return dict(self._data)
    
    def merge(self, other):
        if isinstance(other, Config):
            other = other.to_dict()
        return Config({**self._data, **other})
    
    def __repr__(self):
        items = ', '.join(f'{k}={v!r}' for k, v in self._data.items())
        return f'Config({items})'
    
    def __eq__(self, other):
        if isinstance(other, Config):
            return self._data == other._data
        return NotImplemented`,
    rubric: ["__slots__ for memory efficiency", "Immutability enforced", "Dot notation access works", "Dictionary access works", "to_dict() method", "merge() returns new Config", "Clean __repr__", "object.__setattr__ bypass for init"],
    tags: ["OOP", "immutability", "dunder-methods", "design-patterns"],
    commonMistakes: ["Infinite recursion in __setattr__", "Forgetting object.__setattr__ in __init__", "Mutating in merge instead of returning new"]
  },
  {
    id: "py-q13", courseId: "python", topicId: "py-oop",
    title: "Observer Pattern for Model Monitoring",
    difficulty: "Hard", company: "Weights & Biases", type: "code", language: "python", estimatedMinutes: 20,
    prompt: `Implement the Observer pattern for an ML training loop:\n\n1. \`TrainingLoop\` (Subject) — emits events like 'epoch_start', 'epoch_end', 'loss_computed', 'training_complete'\n2. \`MetricsLogger\` (Observer) — logs metrics to console\n3. \`EarlyStopper\` (Observer) — stops training if loss hasn't improved for N epochs\n4. \`CheckpointSaver\` (Observer) — saves model every K epochs\n\nUse a clean event system where observers register for specific events.`,
    hints: [
      "Store observers as a dict mapping event_name → list of callbacks",
      "Each observer registers with subject.on('event_name', callback)",
      "The subject calls all registered callbacks when emitting an event"
    ],
    modelAnswer: `from collections import defaultdict
from typing import Callable, Any

class TrainingLoop:
    def __init__(self):
        self._listeners = defaultdict(list)
        self._should_stop = False
    
    def on(self, event: str, callback: Callable):
        self._listeners[event].append(callback)
        return self  # Allow chaining
    
    def emit(self, event: str, **data):
        for callback in self._listeners.get(event, []):
            result = callback(**data)
            if result == 'STOP':
                self._should_stop = True
    
    def run(self, epochs, compute_loss_fn):
        self.emit('training_start', total_epochs=epochs)
        for epoch in range(epochs):
            if self._should_stop:
                break
            self.emit('epoch_start', epoch=epoch)
            loss = compute_loss_fn(epoch)
            self.emit('loss_computed', epoch=epoch, loss=loss)
            self.emit('epoch_end', epoch=epoch, loss=loss)
        self.emit('training_complete', epochs_run=epoch + 1)


class MetricsLogger:
    def __init__(self, loop: TrainingLoop):
        loop.on('loss_computed', self.log_loss)
        loop.on('training_complete', self.log_complete)
    
    def log_loss(self, epoch, loss, **_):
        print(f"  Epoch {epoch}: loss = {loss:.4f}")
    
    def log_complete(self, epochs_run, **_):
        print(f"Training complete after {epochs_run} epochs")


class EarlyStopper:
    def __init__(self, loop: TrainingLoop, patience: int = 5):
        self.patience = patience
        self.best_loss = float('inf')
        self.wait = 0
        loop.on('loss_computed', self.check)
    
    def check(self, epoch, loss, **_):
        if loss < self.best_loss:
            self.best_loss = loss
            self.wait = 0
        else:
            self.wait += 1
            if self.wait >= self.patience:
                print(f"  Early stopping at epoch {epoch}")
                return 'STOP'


class CheckpointSaver:
    def __init__(self, loop: TrainingLoop, every_n: int = 5):
        self.every_n = every_n
        loop.on('epoch_end', self.maybe_save)
    
    def maybe_save(self, epoch, **_):
        if (epoch + 1) % self.every_n == 0:
            print(f"  Checkpoint saved at epoch {epoch}")`,
    rubric: ["Clean event registration system", "Subject emits events with data", "Observers register for specific events", "EarlyStopper implements patience logic", "CheckpointSaver saves periodically", "STOP signal propagates correctly", "Decoupled design — observers don't know about each other"],
    tags: ["design-patterns", "observer", "OOP", "ML-training", "events"],
    commonMistakes: ["Tight coupling between observers", "Not handling the stop signal", "Observers modifying shared state unsafely"]
  },
  // ═══ PYTHON FOR DATA (NumPy & Pandas) — 10 questions ═══
  {
    id: "py-q14", courseId: "python", topicId: "py-ds",
    title: "Customer Churn Feature Engineering",
    difficulty: "Medium", company: "Spotify", type: "code", language: "python", estimatedMinutes: 22,
    prompt: `You're building a churn prediction model for a music streaming service.\n\nGiven 'activity_df' (user_id, action_date, action_type ['play','skip','save','share'], song_id, listen_duration_seconds)\nAnd 'users_df' (user_id, subscription_type ['free','premium'], signup_date)\n\nCreate a function that returns one row per user with:\n- days_since_signup\n- total_plays_last_30d, avg_listen_duration, skip_rate, share_rate\n- unique_songs_played\n- days_since_last_activity\n- is_premium (binary)\n- activity_trend (last 15d vs prior 15d count ratio)`,
    hints: [
      "pd.Timestamp.now() minus dates gives timedelta — use .dt.days",
      "GroupBy + agg with named aggregations keeps things clean",
      "For activity_trend, filter two windows and compare counts"
    ],
    modelAnswer: `import pandas as pd
import numpy as np
from datetime import timedelta

def engineer_churn_features(activity_df, users_df):
    now = pd.Timestamp.now()
    cutoff_30d = now - timedelta(days=30)
    cutoff_15d = now - timedelta(days=15)
    
    recent = activity_df[activity_df['action_date'] >= cutoff_30d].copy()
    
    user_features = recent.groupby('user_id').agg(
        total_actions=('action_type', 'count'),
        total_plays=('action_type', lambda x: (x == 'play').sum()),
        total_skips=('action_type', lambda x: (x == 'skip').sum()),
        total_shares=('action_type', lambda x: (x == 'share').sum()),
        avg_listen_duration=('listen_duration_seconds', 'mean'),
        unique_songs=('song_id', 'nunique'),
        last_activity=('action_date', 'max')
    ).reset_index()
    
    user_features['skip_rate'] = user_features['total_skips'] / user_features['total_actions']
    user_features['share_rate'] = user_features['total_shares'] / user_features['total_actions']
    user_features['days_since_last_activity'] = (now - user_features['last_activity']).dt.days
    
    last_15 = recent[recent['action_date'] >= cutoff_15d].groupby('user_id').size().rename('recent_count')
    prior_15 = recent[recent['action_date'] < cutoff_15d].groupby('user_id').size().rename('prior_count')
    trend = pd.concat([last_15, prior_15], axis=1).fillna(0)
    trend['activity_trend'] = (trend['recent_count'] - trend['prior_count']) / trend['prior_count'].replace(0, 1)
    
    result = user_features.merge(users_df[['user_id', 'signup_date', 'subscription_type']], on='user_id', how='left')
    result['days_since_signup'] = (now - result['signup_date']).dt.days
    result['is_premium'] = (result['subscription_type'] == 'premium').astype(int)
    result = result.merge(trend[['activity_trend']], left_on='user_id', right_index=True, how='left')
    
    return result.fillna(0)`,
    rubric: ["Correct 30-day window filtering", "Proper groupby aggregation", "Skip/share rates calculated correctly", "Activity trend compares two windows", "Handles division by zero", "Clean merge with user data", "Returns well-structured DataFrame"],
    tags: ["pandas", "feature-engineering", "groupby", "churn", "time-series"],
    commonMistakes: ["Not handling division by zero in rates", "Using all data instead of 30-day window", "Forgetting to handle users with no activity"]
  },
  {
    id: "py-q15", courseId: "python", topicId: "py-ds",
    title: "Pandas GroupBy Advanced Operations",
    difficulty: "Easy", company: "Amazon", type: "code", language: "python", estimatedMinutes: 12,
    prompt: `Given an orders DataFrame (order_id, customer_id, product_category, amount, order_date), write functions:\n\n1. \`customer_summary(df)\` — per customer: total orders, total spend, avg order value, days between first and last order\n2. \`category_growth(df)\` — per category per month: revenue and month-over-month growth rate\n3. \`rfm_scores(df)\` — Recency, Frequency, Monetary scores (1-5 quintiles) per customer`,
    hints: [
      "pd.Grouper(freq='M') groups by month",
      "pct_change() calculates period-over-period growth",
      "pd.qcut(values, 5, labels=[1,2,3,4,5]) for quintile scoring"
    ],
    modelAnswer: `import pandas as pd
import numpy as np

def customer_summary(df):
    return df.groupby('customer_id').agg(
        total_orders=('order_id', 'nunique'),
        total_spend=('amount', 'sum'),
        avg_order_value=('amount', 'mean'),
        first_order=('order_date', 'min'),
        last_order=('order_date', 'max'),
    ).assign(
        customer_lifetime_days=lambda x: (x['last_order'] - x['first_order']).dt.days
    ).drop(columns=['first_order', 'last_order']).round(2)

def category_growth(df):
    monthly = (df.groupby([pd.Grouper(key='order_date', freq='M'), 'product_category'])
                 .agg(revenue=('amount', 'sum'))
                 .reset_index())
    monthly['mom_growth'] = (monthly.groupby('product_category')['revenue']
                                    .pct_change() * 100).round(1)
    return monthly

def rfm_scores(df):
    now = df['order_date'].max() + pd.Timedelta(days=1)
    rfm = df.groupby('customer_id').agg(
        recency=('order_date', lambda x: (now - x.max()).days),
        frequency=('order_id', 'nunique'),
        monetary=('amount', 'sum')
    )
    rfm['R'] = pd.qcut(rfm['recency'], 5, labels=[5,4,3,2,1]).astype(int)
    rfm['F'] = pd.qcut(rfm['frequency'].rank(method='first'), 5, labels=[1,2,3,4,5]).astype(int)
    rfm['M'] = pd.qcut(rfm['monetary'].rank(method='first'), 5, labels=[1,2,3,4,5]).astype(int)
    rfm['RFM_Score'] = rfm['R'] * 100 + rfm['F'] * 10 + rfm['M']
    return rfm`,
    rubric: ["Customer summary uses correct aggregations", "Category growth uses pd.Grouper for monthly", "pct_change for MoM growth", "RFM recency is inverse (lower days = higher score)", "pd.qcut for quintiles", "Handles ties in frequency/monetary with rank()"],
    tags: ["pandas", "groupby", "RFM", "business-metrics", "time-series"],
    commonMistakes: ["Recency score direction (lower days should be higher score)", "Not handling ties in qcut", "Using count instead of nunique for frequency"]
  },
  {
    id: "py-q16", courseId: "python", topicId: "py-ds",
    title: "NumPy Vectorized Distance Calculation",
    difficulty: "Medium", company: "Lyft", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `You have 1 million pickup/dropoff coordinates and need to calculate distances fast.\n\nImplement using NumPy (NO loops):\n1. \`haversine_vectorized(lat1, lon1, lat2, lon2)\` — vectorized haversine distance in km\n2. \`nearest_k_points(query_point, all_points, k)\` — find K nearest points to a query\n3. Compare performance: vectorized vs loop-based for 100K points`,
    hints: [
      "Haversine formula uses np.sin, np.cos, np.arctan2 — all work on arrays",
      "np.argsort gives indices of sorted distances — take first K",
      "Use np.radians to convert degrees to radians element-wise"
    ],
    modelAnswer: `import numpy as np

def haversine_vectorized(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    return 2 * R * np.arcsin(np.sqrt(a))

def nearest_k_points(query_point, all_points, k):
    """query_point: (lat, lon), all_points: Nx2 array"""
    distances = haversine_vectorized(
        query_point[0], query_point[1],
        all_points[:, 0], all_points[:, 1]
    )
    top_k_indices = np.argpartition(distances, k)[:k]
    sorted_indices = top_k_indices[np.argsort(distances[top_k_indices])]
    return sorted_indices, distances[sorted_indices]

# Performance comparison
def benchmark():
    import time
    n = 100_000
    lats1 = np.random.uniform(40, 41, n)
    lons1 = np.random.uniform(-74, -73, n)
    lats2 = np.random.uniform(40, 41, n)
    lons2 = np.random.uniform(-74, -73, n)
    
    start = time.time()
    result_vec = haversine_vectorized(lats1, lons1, lats2, lons2)
    vec_time = time.time() - start
    
    start = time.time()
    result_loop = [haversine_vectorized(lats1[i], lons1[i], lats2[i], lons2[i]) for i in range(n)]
    loop_time = time.time() - start
    
    print(f"Vectorized: {vec_time:.3f}s | Loop: {loop_time:.3f}s | Speedup: {loop_time/vec_time:.0f}x")`,
    rubric: ["Correct haversine formula", "Fully vectorized (no Python loops)", "Uses np.radians", "argpartition for efficient top-K (not full sort)", "Benchmark shows meaningful speedup", "Handles array broadcasting correctly"],
    tags: ["numpy", "vectorization", "performance", "geospatial", "distance"],
    commonMistakes: ["Using math.sin instead of np.sin", "Full sort instead of argpartition for top-K", "Forgetting degree-to-radian conversion"]
  },
  {
    id: "py-q17", courseId: "python", topicId: "py-ds",
    title: "Data Cleaning Pipeline",
    difficulty: "Easy", company: "Shopify", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `Write a reusable data cleaning pipeline for messy e-commerce data.\n\nFunction \`clean_ecommerce_data(df)\` should:\n1. Standardize column names (lowercase, replace spaces with underscores)\n2. Remove duplicate rows\n3. Handle missing values: fill numeric with median, categorical with mode\n4. Parse dates from multiple formats ('2024-01-15', '01/15/2024', 'Jan 15, 2024')\n5. Remove outliers in 'price' column (beyond 3 standard deviations)\n6. Validate email format using regex\n7. Return (cleaned_df, cleaning_report_dict)`,
    hints: [
      "df.columns = df.columns.str.lower().str.replace(' ', '_')",
      "pd.to_datetime with infer_datetime_format=True handles multiple formats",
      "np.abs(zscore) > 3 identifies outliers"
    ],
    modelAnswer: `import pandas as pd
import numpy as np
import re

def clean_ecommerce_data(df):
    report = {'initial_rows': len(df)}
    df = df.copy()
    
    # 1. Standardize columns
    df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_').str.replace('[^a-z0-9_]', '', regex=True)
    
    # 2. Remove duplicates
    df = df.drop_duplicates()
    report['duplicates_removed'] = report['initial_rows'] - len(df)
    
    # 3. Handle missing values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    for col in numeric_cols:
        nulls = df[col].isna().sum()
        if nulls > 0:
            df[col] = df[col].fillna(df[col].median())
            report[f'{col}_nulls_filled'] = int(nulls)
    
    for col in categorical_cols:
        nulls = df[col].isna().sum()
        if nulls > 0:
            mode_val = df[col].mode()
            if len(mode_val) > 0:
                df[col] = df[col].fillna(mode_val[0])
                report[f'{col}_nulls_filled'] = int(nulls)
    
    # 4. Parse dates
    date_cols = [c for c in df.columns if 'date' in c]
    for col in date_cols:
        df[col] = pd.to_datetime(df[col], infer_datetime_format=True, errors='coerce')
    
    # 5. Remove price outliers
    if 'price' in df.columns:
        mean, std = df['price'].mean(), df['price'].std()
        mask = np.abs(df['price'] - mean) <= 3 * std
        report['price_outliers_removed'] = int((~mask).sum())
        df = df[mask]
    
    # 6. Validate emails
    if 'email' in df.columns:
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        invalid = ~df['email'].fillna('').str.match(email_pattern)
        report['invalid_emails'] = int(invalid.sum())
        df.loc[invalid, 'email'] = None
    
    report['final_rows'] = len(df)
    return df, report`,
    rubric: ["Column name standardization", "Deduplication", "Numeric median fill, categorical mode fill", "Multi-format date parsing", "Z-score outlier removal", "Email regex validation", "Cleaning report returned"],
    tags: ["data-cleaning", "pandas", "regex", "preprocessing", "ETL"],
    commonMistakes: ["Modifying original DataFrame (need .copy())", "Not handling empty mode result", "Using mean instead of median for skewed data"]
  },
  {
    id: "py-q18", courseId: "python", topicId: "py-ds",
    title: "Pandas Merge Debugging Challenge",
    difficulty: "Medium", company: "Stripe", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `Your junior analyst merged two DataFrames and the row count exploded from 10,000 to 847,000. Debug and fix it.\n\nGiven:\n- orders_df (10,000 rows): order_id, customer_id, product_id, amount\n- products_df (500 rows): product_id, product_name, category (but product_id has duplicates!)\n\n1. Write a function \`diagnose_merge(left, right, on)\` that reports: key uniqueness in both tables, expected result size, potential fanout\n2. Write \`safe_merge(left, right, on, expect='many_to_one')\` that validates the merge type before executing and raises if unexpected\n3. Fix the products_df deduplication issue`,
    hints: [
      "A many-to-many merge causes the row explosion (cartesian product per key)",
      "Check df[key].duplicated().any() before merging",
      "The 'validate' parameter in pd.merge catches this automatically"
    ],
    modelAnswer: `import pandas as pd

def diagnose_merge(left, right, on):
    left_dups = left[on].duplicated().sum()
    right_dups = right[on].duplicated().sum()
    left_unique = left[on].nunique()
    right_unique = right[on].nunique()
    overlap = set(left[on]) & set(right[on])
    
    report = {
        'left_rows': len(left),
        'right_rows': len(right),
        'left_duplicates_on_key': int(left_dups),
        'right_duplicates_on_key': int(right_dups),
        'left_unique_keys': int(left_unique),
        'right_unique_keys': int(right_unique),
        'overlapping_keys': len(overlap),
        'merge_type': 'many_to_many' if left_dups > 0 and right_dups > 0
                      else 'many_to_one' if left_dups > 0
                      else 'one_to_many' if right_dups > 0
                      else 'one_to_one',
    }
    
    if report['merge_type'] == 'many_to_many':
        report['WARNING'] = 'Many-to-many merge will cause row explosion!'
    
    return report

def safe_merge(left, right, on, expect='many_to_one'):
    try:
        return pd.merge(left, right, on=on, how='left', validate=expect)
    except pd.errors.MergeError as e:
        diag = diagnose_merge(left, right, on)
        raise ValueError(
            f"Merge validation failed. Expected '{expect}' but got '{diag['merge_type']}'.\\n"
            f"Right table has {diag['right_duplicates_on_key']} duplicate keys.\\n"
            f"Fix: deduplicate the right table before merging."
        ) from e

def fix_products(products_df):
    # Keep the most recent entry per product_id
    return (products_df
            .sort_values('product_id')
            .drop_duplicates(subset='product_id', keep='last')
            .reset_index(drop=True))`,
    rubric: ["Diagnoses key uniqueness on both sides", "Identifies merge type correctly", "Uses pd.merge validate parameter", "Clear error message with fix suggestion", "Deduplication strategy for products", "Explains why row count exploded"],
    tags: ["pandas", "merge", "debugging", "data-quality", "joins"],
    commonMistakes: ["Not checking both sides for duplicates", "Using inner join when left is intended", "Not understanding many-to-many cartesian product"]
  },
  {
    id: "py-q19", courseId: "python", topicId: "py-ds",
    title: "Time Series Resampling & Rolling Stats",
    difficulty: "Medium", company: "Coinbase", type: "code", language: "python", estimatedMinutes: 18,
    prompt: `Given minute-level crypto trading data (timestamp, price, volume), write functions:\n\n1. \`resample_ohlcv(df, freq='1H')\` — resample to OHLCV (open, high, low, close, volume) at any frequency\n2. \`add_technical_indicators(df)\` — add 7-day and 30-day moving averages, Bollinger Bands (20-day, 2 std), RSI (14-period)\n3. \`detect_anomalies(df, window=24, threshold=3)\` — flag prices that are >threshold std devs from rolling mean`,
    hints: [
      "resample('1H').agg({'price': ['first','max','min','last'], 'volume': 'sum'})",
      "Bollinger: middle=SMA(20), upper=middle+2*std, lower=middle-2*std",
      "RSI: 100 - 100/(1 + avg_gain/avg_loss) over 14 periods"
    ],
    modelAnswer: `import pandas as pd
import numpy as np

def resample_ohlcv(df, freq='1H'):
    df = df.set_index('timestamp') if 'timestamp' in df.columns else df
    ohlcv = df.resample(freq).agg(
        open=('price', 'first'),
        high=('price', 'max'),
        low=('price', 'min'),
        close=('price', 'last'),
        volume=('volume', 'sum')
    ).dropna()
    return ohlcv

def add_technical_indicators(df):
    df = df.copy()
    df['sma_7'] = df['close'].rolling(7).mean()
    df['sma_30'] = df['close'].rolling(30).mean()
    
    # Bollinger Bands
    df['bb_middle'] = df['close'].rolling(20).mean()
    bb_std = df['close'].rolling(20).std()
    df['bb_upper'] = df['bb_middle'] + 2 * bb_std
    df['bb_lower'] = df['bb_middle'] - 2 * bb_std
    
    # RSI
    delta = df['close'].diff()
    gain = delta.where(delta > 0, 0).rolling(14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
    rs = gain / loss.replace(0, np.nan)
    df['rsi_14'] = 100 - (100 / (1 + rs))
    
    return df

def detect_anomalies(df, window=24, threshold=3):
    df = df.copy()
    rolling_mean = df['close'].rolling(window).mean()
    rolling_std = df['close'].rolling(window).std()
    df['z_score'] = (df['close'] - rolling_mean) / rolling_std
    df['is_anomaly'] = df['z_score'].abs() > threshold
    return df`,
    rubric: ["Correct OHLCV resampling", "Moving averages at correct windows", "Bollinger Bands formula correct", "RSI formula correct", "Anomaly detection uses rolling z-score", "Handles division by zero in RSI", "Returns copies, doesn't mutate"],
    tags: ["time-series", "pandas", "finance", "rolling-statistics", "technical-analysis"],
    commonMistakes: ["Not handling the index for resampling", "RSI formula inverted", "Using expanding instead of rolling window"]
  },
  // ═══ MORE MIXED QUESTIONS (remaining to reach 40) ═══
  {
    id: "py-q20", courseId: "python", topicId: "py-ds",
    title: "A/B Test Statistical Analysis",
    difficulty: "Hard", company: "Meta", type: "code", language: "python", estimatedMinutes: 25,
    prompt: `Build a reusable A/B test analysis function using only math (no scipy).\n\nFunction \`analyze_ab_test(control_conv, control_total, treat_conv, treat_total, alpha=0.05)\` returns:\n- control_rate, treatment_rate\n- absolute_lift, relative_lift\n- p_value (two-tailed z-test for proportions)\n- confidence_interval_95\n- is_significant\n- required_sample_size (for observed effect at 80% power)`,
    hints: [
      "Pooled proportion: (c1+c2)/(n1+n2)",
      "Z = (p1-p2) / sqrt(p_pool*(1-p_pool)*(1/n1+1/n2))",
      "Sample size: n = (z_α + z_β)² * (p1(1-p1) + p2(1-p2)) / (p1-p2)²"
    ],
    modelAnswer: `import math

def analyze_ab_test(control_conv, control_total, treat_conv, treat_total, alpha=0.05):
    p_c = control_conv / control_total
    p_t = treat_conv / treat_total
    p_pool = (control_conv + treat_conv) / (control_total + treat_total)
    
    se = math.sqrt(p_pool * (1-p_pool) * (1/control_total + 1/treat_total))
    z = (p_t - p_c) / se if se > 0 else 0
    p_value = 2 * (1 - _norm_cdf(abs(z)))
    
    se_diff = math.sqrt(p_c*(1-p_c)/control_total + p_t*(1-p_t)/treat_total)
    z_alpha = 1.96
    ci = ((p_t - p_c) - z_alpha * se_diff, (p_t - p_c) + z_alpha * se_diff)
    
    z_beta = 0.842  # 80% power
    effect = abs(p_t - p_c)
    n_required = math.ceil(((z_alpha+z_beta)**2 * (p_c*(1-p_c)+p_t*(1-p_t))) / effect**2) if effect > 0 else float('inf')
    
    return {
        'control_rate': round(p_c, 4), 'treatment_rate': round(p_t, 4),
        'absolute_lift': round(p_t - p_c, 4),
        'relative_lift': round((p_t - p_c) / p_c, 4) if p_c > 0 else None,
        'p_value': round(p_value, 4),
        'confidence_interval_95': (round(ci[0], 4), round(ci[1], 4)),
        'is_significant': p_value < alpha,
        'required_sample_size_per_group': n_required,
    }

def _norm_cdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))`,
    rubric: ["Correct pooled proportion", "Z-test formula correct", "Two-tailed p-value", "CI uses unpooled SE", "Sample size formula correct", "No external libraries", "Handles edge cases"],
    tags: ["statistics", "ab-testing", "hypothesis-testing", "from-scratch"],
    commonMistakes: ["Using pooled SE for CI (should be unpooled)", "One-tailed instead of two-tailed", "Wrong power formula"]
  },
  {
    id: "py-q21", courseId: "python", topicId: "py-control",
    title: "Async Data Fetcher",
    difficulty: "Hard", company: "Twilio", type: "code", language: "python", estimatedMinutes: 20,
    prompt: `You need to fetch data from 100 API endpoints. Sequential requests take 5 minutes. Build an async solution.\n\nWrite:\n1. \`async fetch_one(session, url, retries=3)\` — fetch one URL with retry\n2. \`async fetch_batch(urls, max_concurrent=10)\` — fetch all URLs with concurrency limit\n3. \`async fetch_with_rate_limit(urls, requests_per_second=5)\` — rate-limited fetching\n\nUse aiohttp and asyncio.Semaphore for concurrency control.`,
    hints: [
      "asyncio.Semaphore(n) limits concurrent tasks",
      "asyncio.gather(*tasks) runs tasks concurrently",
      "asyncio.sleep(1/rate) between requests for rate limiting"
    ],
    modelAnswer: `import asyncio
import aiohttp
import time

async def fetch_one(session, url, retries=3):
    for attempt in range(retries):
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    return {'url': url, 'data': await resp.json(), 'status': 'success'}
                elif resp.status == 429:
                    await asyncio.sleep(2 ** attempt)
                    continue
                else:
                    return {'url': url, 'data': None, 'status': f'error_{resp.status}'}
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            if attempt == retries - 1:
                return {'url': url, 'data': None, 'status': f'failed: {str(e)}'}
            await asyncio.sleep(2 ** attempt)

async def fetch_batch(urls, max_concurrent=10):
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def bounded_fetch(session, url):
        async with semaphore:
            return await fetch_one(session, url)
    
    async with aiohttp.ClientSession() as session:
        tasks = [bounded_fetch(session, url) for url in urls]
        return await asyncio.gather(*tasks)

async def fetch_with_rate_limit(urls, requests_per_second=5):
    results = []
    interval = 1.0 / requests_per_second
    
    async with aiohttp.ClientSession() as session:
        for url in urls:
            result = await fetch_one(session, url)
            results.append(result)
            await asyncio.sleep(interval)
    
    return results`,
    rubric: ["Proper async/await syntax", "Semaphore for concurrency limiting", "Retry with exponential backoff", "Handles 429 rate limit responses", "Rate limiting implementation", "Timeout handling", "Error reporting per URL"],
    tags: ["async", "aiohttp", "concurrency", "APIs", "rate-limiting"],
    commonMistakes: ["Not using semaphore (too many concurrent requests)", "Blocking sleep instead of asyncio.sleep", "Not closing the session"]
  },
  {
    id: "py-q22", courseId: "python", topicId: "py-oop",
    title: "DataFrame Wrapper with Method Chaining",
    difficulty: "Medium", company: "Palantir", type: "code", language: "python", estimatedMinutes: 18,
    prompt: `Build a \`DataPipe\` class that wraps a pandas DataFrame and enables fluent method chaining with logging:\n\n\`\`\`python\nresult = (DataPipe(df)\n    .filter_rows(lambda r: r['age'] > 18)\n    .select_columns(['name', 'age', 'city'])\n    .rename({'city': 'location'})\n    .add_column('age_group', lambda r: 'young' if r['age'] < 30 else 'senior')\n    .sort_by('age', ascending=False)\n    .log_shape()\n    .to_df())\n\`\`\`\n\nEvery operation returns self for chaining. Include a .history property that tracks all operations applied.`,
    hints: [
      "Every method modifies self._df and returns self",
      "Store operations in a list: self._history.append('filter_rows: 1000→850 rows')",
      "to_df() returns the underlying DataFrame, breaking the chain"
    ],
    modelAnswer: `import pandas as pd

class DataPipe:
    def __init__(self, df):
        self._df = df.copy()
        self._history = [f"Created DataPipe: {df.shape}"]
    
    def filter_rows(self, condition):
        before = len(self._df)
        self._df = self._df[self._df.apply(condition, axis=1)]
        self._history.append(f"filter_rows: {before}→{len(self._df)} rows")
        return self
    
    def select_columns(self, cols):
        self._df = self._df[cols]
        self._history.append(f"select_columns: {cols}")
        return self
    
    def rename(self, mapping):
        self._df = self._df.rename(columns=mapping)
        self._history.append(f"rename: {mapping}")
        return self
    
    def add_column(self, name, func):
        self._df[name] = self._df.apply(func, axis=1)
        self._history.append(f"add_column: '{name}'")
        return self
    
    def sort_by(self, column, ascending=True):
        self._df = self._df.sort_values(column, ascending=ascending)
        self._history.append(f"sort_by: '{column}' {'asc' if ascending else 'desc'}")
        return self
    
    def drop_nulls(self, subset=None):
        before = len(self._df)
        self._df = self._df.dropna(subset=subset)
        self._history.append(f"drop_nulls: {before}→{len(self._df)} rows")
        return self
    
    def log_shape(self):
        print(f"  Shape: {self._df.shape}")
        return self
    
    @property
    def history(self):
        return self._history
    
    def to_df(self):
        return self._df.copy()
    
    def __repr__(self):
        return f"DataPipe({self._df.shape}, {len(self._history)} operations)"`,
    rubric: ["Every method returns self", "History tracks all operations", "Defensive copies (input and output)", "Method chaining works fluently", "log_shape for debugging", "to_df breaks chain and returns DataFrame", "Clean __repr__"],
    tags: ["OOP", "method-chaining", "pandas", "fluent-interface", "design-patterns"],
    commonMistakes: ["Forgetting to return self", "Mutating the original DataFrame", "History not tracking row count changes"]
  },
  // ═══ FILL TO 40 — More varied questions ═══
  {
    id: "py-q23", courseId: "python", topicId: "py-basics",
    title: "JSON Schema Validator", difficulty: "Medium", company: "Postman", type: "code", language: "python", estimatedMinutes: 18,
    prompt: `Build a lightweight JSON schema validator without external libraries. Support these type checks:\n- "string", "int", "float", "bool", "list", "dict"\n- "required": true/false\n- "min"/"max" for numbers\n- "min_length"/"max_length" for strings\n- "items" schema for list elements\n- "properties" for nested object validation\n\nReturn a list of all validation errors with dot-notation paths (e.g., "user.address.zip").`,
    hints: ["Recursion for nested objects", "Build the path string as you recurse", "Collect errors, don't stop at first one"],
    modelAnswer: `def validate(data, schema, path="root"):
    errors = []
    schema_type = schema.get("type")
    type_map = {"string": str, "int": int, "float": (int, float), "bool": bool, "list": list, "dict": dict}
    
    if data is None:
        if schema.get("required", True):
            errors.append(f"{path}: required but missing")
        return errors
    
    if schema_type and not isinstance(data, type_map.get(schema_type, object)):
        errors.append(f"{path}: expected {schema_type}, got {type(data).__name__}")
        return errors
    
    if schema_type in ("int", "float"):
        if "min" in schema and data < schema["min"]:
            errors.append(f"{path}: {data} < min({schema['min']})")
        if "max" in schema and data > schema["max"]:
            errors.append(f"{path}: {data} > max({schema['max']})")
    
    if schema_type == "string":
        if "min_length" in schema and len(data) < schema["min_length"]:
            errors.append(f"{path}: length {len(data)} < min_length({schema['min_length']})")
        if "max_length" in schema and len(data) > schema["max_length"]:
            errors.append(f"{path}: length {len(data)} > max_length({schema['max_length']})")
    
    if schema_type == "list" and "items" in schema:
        for i, item in enumerate(data):
            errors.extend(validate(item, schema["items"], f"{path}[{i}]"))
    
    if schema_type == "dict" and "properties" in schema:
        for key, prop_schema in schema["properties"].items():
            errors.extend(validate(data.get(key), prop_schema, f"{path}.{key}"))
    
    return errors`,
    rubric: ["Type checking works", "Required field validation", "Min/max for numbers", "String length validation", "Nested object recursion", "List item validation", "Dot-notation error paths", "Collects all errors"],
    tags: ["validation", "recursion", "JSON", "schema"],
    commonMistakes: ["Stopping at first error", "Not handling None/missing fields", "Wrong path construction for arrays"]
  },
  {
    id: "py-q24", courseId: "python", topicId: "py-ds",
    title: "Pivot Table from Scratch", difficulty: "Easy", company: "Tableau", type: "code", language: "python", estimatedMinutes: 12,
    prompt: `Implement pivot_table using only basic pandas (no df.pivot_table).\n\nFunction \`manual_pivot(df, index, columns, values, aggfunc='sum')\` should:\n1. Group by index + columns\n2. Aggregate values with the specified function\n3. Reshape so that unique 'columns' values become column headers\n4. Handle missing combinations with NaN or 0`,
    hints: ["groupby([index, columns]).agg() then .unstack()", "Or use manual loops with set operations", "fillna(0) for missing combinations"],
    modelAnswer: `import pandas as pd

def manual_pivot(df, index, columns, values, aggfunc='sum'):
    agg_map = {'sum': 'sum', 'mean': 'mean', 'count': 'count', 'min': 'min', 'max': 'max'}
    
    grouped = df.groupby([index, columns])[values].agg(agg_map.get(aggfunc, aggfunc))
    result = grouped.unstack(fill_value=0)
    result.columns.name = None
    return result`,
    rubric: ["Correct groupby with two keys", "Aggregation function applied", "Unstack reshapes correctly", "Missing values handled", "Multiple aggfunc support"],
    tags: ["pandas", "pivot-tables", "reshaping", "aggregation"],
    commonMistakes: ["Forgetting fill_value in unstack", "Not handling multiple aggfuncs", "Index not set correctly"]
  },
  {
    id: "py-q25", courseId: "python", topicId: "py-basics", title: "Implement a Simple LRU Cache", difficulty: "Hard", company: "Google", type: "code", language: "python", estimatedMinutes: 25,
    prompt: `Implement a Least Recently Used cache class without using functools.lru_cache or OrderedDict.\n\nClass \`LRUCache(capacity)\` supports:\n- \`get(key)\` — return value or -1, marks as recently used\n- \`put(key, value)\` — insert/update, evict LRU if at capacity\n- Both operations must be O(1)\n\nHint: Use a doubly-linked list + hash map.`,
    hints: ["Doubly-linked list tracks access order", "Hash map provides O(1) key lookup", "Move-to-front on access, remove tail on eviction"],
    modelAnswer: `class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head
    
    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev
    
    def _add_front(self, node):
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node
    
    def get(self, key):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_front(node)
        return node.val
    
    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self._add_front(node)
        self.cache[key] = node
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]`,
    rubric: ["Doubly-linked list implementation", "Hash map for O(1) lookup", "O(1) get and put", "Correct eviction of LRU item", "Move-to-front on access", "Handles update of existing key", "Sentinel nodes for clean edge cases"],
    tags: ["data-structures", "linked-list", "cache", "algorithms", "OOP"],
    commonMistakes: ["Not updating on existing key put", "O(n) eviction (scanning list)", "Broken pointer updates"]
  },
  // Questions 26-40: More variety
  { id: "py-q26", courseId: "python", topicId: "py-ds", title: "Window Functions in Pandas", difficulty: "Medium", company: "LinkedIn", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `Replicate SQL window functions in pandas:\n1. ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)\n2. Running sum of sales per region\n3. Percent of total within each group\n4. LAG/LEAD equivalent\n\nWrite each as a one-liner using groupby + transform/cumsum/shift.`,
    hints: ["groupby().cumcount() for row_number", "groupby().cumsum() for running totals", "x / groupby().transform('sum') for percent of total"],
    modelAnswer: `import pandas as pd\n\ndef window_functions_demo(df):\n    # ROW_NUMBER\n    df['row_num'] = df.sort_values('salary', ascending=False).groupby('dept').cumcount() + 1\n    \n    # Running sum\n    df['running_sales'] = df.sort_values('date').groupby('region')['sales'].cumsum()\n    \n    # Percent of total\n    df['pct_of_dept'] = df['salary'] / df.groupby('dept')['salary'].transform('sum')\n    \n    # LAG / LEAD\n    df['prev_sales'] = df.sort_values('date').groupby('region')['sales'].shift(1)\n    df['next_sales'] = df.sort_values('date').groupby('region')['sales'].shift(-1)\n    \n    return df`,
    rubric: ["ROW_NUMBER equivalent correct", "Running sum correct", "Percent of total correct", "LAG/LEAD via shift", "Proper sort before groupby operations"],
    tags: ["pandas", "window-functions", "groupby", "transform"],
    commonMistakes: ["Forgetting to sort before cumsum/shift", "Using apply instead of transform", "Off-by-one in cumcount"] },
  { id: "py-q27", courseId: "python", topicId: "py-control", title: "CLI Tool with argparse", difficulty: "Easy", company: "GitHub", type: "code", language: "python", estimatedMinutes: 12,
    prompt: `Build a CLI data tool using argparse:\n\`\`\`\npython datatool.py inspect data.csv --rows 10 --stats\npython datatool.py clean data.csv --output cleaned.csv --drop-nulls --dedup\npython datatool.py merge file1.csv file2.csv --on id --how left\n\`\`\`\nUse subparsers for each command. Each command should work end-to-end.`,
    hints: ["argparse.ArgumentParser().add_subparsers() for commands", "Each subparser gets its own arguments", "Set a default function per subparser"],
    modelAnswer: `import argparse\nimport pandas as pd\n\ndef cmd_inspect(args):\n    df = pd.read_csv(args.file)\n    print(f"Shape: {df.shape}")\n    print(f"Columns: {list(df.columns)}")\n    print(df.head(args.rows))\n    if args.stats:\n        print(df.describe())\n\ndef cmd_clean(args):\n    df = pd.read_csv(args.file)\n    if args.drop_nulls: df = df.dropna()\n    if args.dedup: df = df.drop_duplicates()\n    df.to_csv(args.output, index=False)\n    print(f"Cleaned: {df.shape} → {args.output}")\n\ndef cmd_merge(args):\n    df1 = pd.read_csv(args.files[0])\n    df2 = pd.read_csv(args.files[1])\n    result = pd.merge(df1, df2, on=args.on, how=args.how)\n    print(f"Merged: {result.shape}")\n\ndef main():\n    parser = argparse.ArgumentParser(prog='datatool')\n    subs = parser.add_subparsers(dest='command')\n    \n    ins = subs.add_parser('inspect')\n    ins.add_argument('file')\n    ins.add_argument('--rows', type=int, default=5)\n    ins.add_argument('--stats', action='store_true')\n    ins.set_defaults(func=cmd_inspect)\n    \n    cln = subs.add_parser('clean')\n    cln.add_argument('file')\n    cln.add_argument('--output', required=True)\n    cln.add_argument('--drop-nulls', action='store_true')\n    cln.add_argument('--dedup', action='store_true')\n    cln.set_defaults(func=cmd_clean)\n    \n    mrg = subs.add_parser('merge')\n    mrg.add_argument('files', nargs=2)\n    mrg.add_argument('--on', required=True)\n    mrg.add_argument('--how', default='inner')\n    mrg.set_defaults(func=cmd_merge)\n    \n    args = parser.parse_args()\n    if hasattr(args, 'func'): args.func(args)\n    else: parser.print_help()\n\nif __name__ == '__main__': main()`,
    rubric: ["Subparsers for each command", "Correct argument types and defaults", "store_true for flags", "Each command works end-to-end", "Help text available"],
    tags: ["CLI", "argparse", "tooling", "scripting"],
    commonMistakes: ["Not setting defaults(func=...)", "Missing required arguments", "Forgetting __main__ guard"] },
  { id: "py-q28", courseId: "python", topicId: "py-ds", title: "Memory-Efficient Large CSV Processing", difficulty: "Medium", company: "Databricks", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `Process a 10GB CSV without loading it all into memory:\n1. Use chunked reading with pd.read_csv(chunksize=)\n2. Downcasting numeric types to save memory\n3. Using categorical dtype for low-cardinality columns\n4. Write a function that computes global statistics across chunks (mean, std, count) correctly\n\nShow memory usage before and after optimization.`,
    hints: ["pd.read_csv(chunksize=10000) returns an iterator", "Welford's algorithm for streaming mean/variance", "astype('category') for columns with few unique values"],
    modelAnswer: `import pandas as pd\nimport numpy as np\n\ndef optimize_dtypes(df):\n    for col in df.select_dtypes(include=['int']):\n        df[col] = pd.to_numeric(df[col], downcast='integer')\n    for col in df.select_dtypes(include=['float']):\n        df[col] = pd.to_numeric(df[col], downcast='float')\n    for col in df.select_dtypes(include=['object']):\n        if df[col].nunique() / len(df) < 0.05:\n            df[col] = df[col].astype('category')\n    return df\n\ndef chunked_statistics(filepath, chunksize=50000):\n    n, mean, m2 = 0, 0, 0  # Welford's online algorithm\n    total_sum = 0\n    \n    for chunk in pd.read_csv(filepath, chunksize=chunksize):\n        chunk = optimize_dtypes(chunk)\n        values = chunk['amount'].dropna().values\n        for x in values:\n            n += 1\n            delta = x - mean\n            mean += delta / n\n            m2 += delta * (x - mean)\n            total_sum += x\n    \n    return {'count': n, 'mean': mean, 'std': np.sqrt(m2/n) if n > 0 else 0, 'sum': total_sum}`,
    rubric: ["Chunked reading", "Type downcasting", "Categorical for low-cardinality", "Welford's algorithm for streaming stats", "Memory comparison shown"],
    tags: ["memory-efficiency", "large-data", "pandas", "streaming"],
    commonMistakes: ["Computing mean by averaging chunk means (wrong!)", "Not handling the last partial chunk", "Forgetting to downcast"] },
  { id: "py-q29", courseId: "python", topicId: "py-oop", title: "Plugin Architecture", difficulty: "Hard", company: "Airflow", type: "code", language: "python", estimatedMinutes: 22,
    prompt: `Design a plugin architecture for a data transformation framework:\n1. Base \`TransformPlugin\` class with register/discover mechanics\n2. Plugins auto-register when defined (metaclass or decorator)\n3. A \`Pipeline\` class that chains plugins by name\n4. Built-in plugins: 'lowercase', 'strip_whitespace', 'parse_dates', 'fill_nulls'\n\nUsage: Pipeline(['lowercase', 'strip_whitespace', 'fill_nulls']).run(df)`,
    hints: ["A class-level registry dict on the base class", "__init_subclass__ hook auto-registers subclasses", "Or use a decorator @register('name')"],
    modelAnswer: `import pandas as pd\n\nclass TransformPlugin:\n    _registry = {}\n    \n    def __init_subclass__(cls, name=None, **kwargs):\n        super().__init_subclass__(**kwargs)\n        if name:\n            cls._registry[name] = cls()\n    \n    def transform(self, df):\n        raise NotImplementedError\n\nclass Lowercase(TransformPlugin, name='lowercase'):\n    def transform(self, df):\n        for col in df.select_dtypes(include='object'):\n            df[col] = df[col].str.lower()\n        return df\n\nclass StripWhitespace(TransformPlugin, name='strip_whitespace'):\n    def transform(self, df):\n        for col in df.select_dtypes(include='object'):\n            df[col] = df[col].str.strip()\n        return df\n\nclass ParseDates(TransformPlugin, name='parse_dates'):\n    def transform(self, df):\n        for col in df.columns:\n            if 'date' in col.lower():\n                df[col] = pd.to_datetime(df[col], errors='coerce')\n        return df\n\nclass FillNulls(TransformPlugin, name='fill_nulls'):\n    def transform(self, df):\n        for col in df.select_dtypes(include='number'):\n            df[col] = df[col].fillna(df[col].median())\n        for col in df.select_dtypes(include='object'):\n            df[col] = df[col].fillna('unknown')\n        return df\n\nclass Pipeline:\n    def __init__(self, steps):\n        self.steps = []\n        for name in steps:\n            if name not in TransformPlugin._registry:\n                raise ValueError(f"Unknown plugin: '{name}'. Available: {list(TransformPlugin._registry.keys())}")\n            self.steps.append((name, TransformPlugin._registry[name]))\n    \n    def run(self, df):\n        df = df.copy()\n        for name, plugin in self.steps:\n            df = plugin.transform(df)\n        return df`,
    rubric: ["Auto-registration via __init_subclass__", "Clean plugin interface", "Pipeline chains by name", "Error on unknown plugin", "Each plugin is self-contained", "Defensive copy in Pipeline.run"],
    tags: ["design-patterns", "plugins", "metaclass", "OOP", "architecture"],
    commonMistakes: ["Manual registration (defeats the purpose)", "Plugins modifying state unsafely", "No validation of plugin names"] },
  { id: "py-q30", courseId: "python", topicId: "py-ds", title: "Pandas Performance: Apply vs Vectorize", difficulty: "Easy", company: "Shopify", type: "code", language: "python", estimatedMinutes: 10,
    prompt: `You inherit code using .apply() everywhere. Rewrite these 5 operations as vectorized pandas:\n\n1. df.apply(lambda r: r['price'] * r['quantity'], axis=1)\n2. df['name'].apply(lambda x: x.lower().strip())\n3. df.apply(lambda r: 'high' if r['score'] > 80 else 'low', axis=1)\n4. df['date'].apply(lambda x: x.year)\n5. df.apply(lambda r: r['a'] + r['b'] + r['c'], axis=1)\n\nBenchmark each pair on 1M rows.`,
    hints: ["Direct column math: df['price'] * df['quantity']", "String methods: df['name'].str.lower().str.strip()", "np.where for conditional: np.where(df['score']>80, 'high', 'low')"],
    modelAnswer: `import pandas as pd\nimport numpy as np\n\n# 1. Vectorized arithmetic\ndf['total'] = df['price'] * df['quantity']  # Not: df.apply(lambda r: r['price']*r['quantity'], axis=1)\n\n# 2. Vectorized string ops\ndf['name_clean'] = df['name'].str.lower().str.strip()  # Not: df['name'].apply(lambda x: x.lower().strip())\n\n# 3. Vectorized conditional\ndf['level'] = np.where(df['score'] > 80, 'high', 'low')  # Not: df.apply(lambda r: 'high' if ...)\n\n# 4. Vectorized datetime\ndf['year'] = df['date'].dt.year  # Not: df['date'].apply(lambda x: x.year)\n\n# 5. Vectorized sum\ndf['total'] = df[['a','b','c']].sum(axis=1)  # Not: df.apply(lambda r: r['a']+r['b']+r['c'], axis=1)\n\n# Typical speedup: 10-100x on 1M rows`,
    rubric: ["All 5 correctly vectorized", "Uses .str accessor", "Uses np.where for conditionals", "Uses .dt accessor for dates", "Explains performance difference"],
    tags: ["pandas", "performance", "vectorization", "best-practices"],
    commonMistakes: ["Using apply for simple arithmetic", "Not knowing .str and .dt accessors", "Using iterrows (even worse than apply)"] },
  { id: "py-q31", courseId: "python", topicId: "py-basics", title: "Implement Map, Filter, Reduce", difficulty: "Easy", company: "Teaching", type: "code", language: "python", estimatedMinutes: 12,
    prompt: `Implement your own versions of map, filter, and reduce (without using builtins):\n1. my_map(func, iterable) → list\n2. my_filter(func, iterable) → list\n3. my_reduce(func, iterable, initial=None) → value\n\nThen combine them to: given a list of strings, filter to length>3, map to uppercase, reduce to concatenate with commas.`,
    hints: ["Simple loop + append for map/filter", "Reduce needs an accumulator that updates each iteration", "Handle the initial value being None (use first element)"],
    modelAnswer: `def my_map(func, iterable):\n    return [func(item) for item in iterable]\n\ndef my_filter(func, iterable):\n    return [item for item in iterable if func(item)]\n\ndef my_reduce(func, iterable, initial=None):\n    it = iter(iterable)\n    acc = initial if initial is not None else next(it)\n    for item in it:\n        acc = func(acc, item)\n    return acc\n\n# Combined\nwords = ['hi', 'hello', 'hey', 'world', 'go', 'python']\nresult = my_reduce(\n    lambda a, b: f"{a}, {b}",\n    my_map(str.upper, my_filter(lambda s: len(s) > 3, words))\n)  # "HELLO, WORLD, PYTHON"`,
    rubric: ["map applies function to each element", "filter keeps elements where func is truthy", "reduce handles initial value correctly", "Combined pipeline works", "Handles empty iterables"],
    tags: ["functional-programming", "fundamentals", "from-scratch"],
    commonMistakes: ["Not handling empty list in reduce", "Mutating the input", "Forgetting initial value logic"] },
  { id: "py-q32", courseId: "python", topicId: "py-oop", title: "State Machine for Order Processing", difficulty: "Medium", company: "Shopify", type: "code", language: "python", estimatedMinutes: 18,
    prompt: `Model an e-commerce order lifecycle as a state machine:\n\nStates: pending → confirmed → processing → shipped → delivered (also: cancelled from any pre-shipped state)\n\nImplement:\n1. \`Order\` class with state transitions\n2. Validation: only allow legal transitions\n3. Hooks: on_enter_state and on_exit_state callbacks\n4. History: track all state transitions with timestamps`,
    hints: ["Define allowed transitions as a dict: {state: [allowed_next_states]}", "raise InvalidTransition for illegal state changes", "datetime.now() for transition timestamps"],
    modelAnswer: `from datetime import datetime\n\nclass InvalidTransition(Exception): pass\n\nclass Order:\n    TRANSITIONS = {\n        'pending': ['confirmed', 'cancelled'],\n        'confirmed': ['processing', 'cancelled'],\n        'processing': ['shipped', 'cancelled'],\n        'shipped': ['delivered'],\n        'delivered': [],\n        'cancelled': [],\n    }\n    \n    def __init__(self, order_id):\n        self.order_id = order_id\n        self.state = 'pending'\n        self.history = [('pending', datetime.now(), 'created')]\n        self._hooks = {}\n    \n    def on(self, event, callback):\n        self._hooks.setdefault(event, []).append(callback)\n    \n    def transition_to(self, new_state, reason=''):\n        if new_state not in self.TRANSITIONS.get(self.state, []):\n            raise InvalidTransition(f"Cannot go from '{self.state}' to '{new_state}'")\n        \n        for cb in self._hooks.get(f'exit_{self.state}', []): cb(self)\n        old_state = self.state\n        self.state = new_state\n        self.history.append((new_state, datetime.now(), reason))\n        for cb in self._hooks.get(f'enter_{new_state}', []): cb(self)\n        return self\n    \n    def confirm(self): return self.transition_to('confirmed')\n    def process(self): return self.transition_to('processing')\n    def ship(self): return self.transition_to('shipped')\n    def deliver(self): return self.transition_to('delivered')\n    def cancel(self, reason=''): return self.transition_to('cancelled', reason)`,
    rubric: ["Valid transitions defined", "Illegal transitions raise exception", "State history with timestamps", "Hooks for enter/exit", "Convenience methods", "Cancel works from multiple states"],
    tags: ["state-machine", "OOP", "design-patterns", "e-commerce"],
    commonMistakes: ["Allowing transitions from terminal states", "Not recording transition history", "Hooks firing in wrong order"] },
  { id: "py-q33", courseId: "python", topicId: "py-ds", title: "Pandas MultiIndex Gymnastics", difficulty: "Hard", company: "Bloomberg", type: "code", language: "python", estimatedMinutes: 20,
    prompt: `Given financial data with MultiIndex (date, ticker):\n1. Calculate daily returns per ticker\n2. Compute rolling 30-day correlation between any two tickers\n3. Rank tickers by Sharpe ratio (annualized)\n4. Create a cross-sectional z-score (normalize each ticker's return relative to all tickers that day)\n\nAll operations should use MultiIndex properly — no resetting index.`,
    hints: ["groupby(level='ticker') for per-ticker operations", "unstack('ticker') to get wide format for correlation", "Cross-sectional: groupby(level='date').transform(lambda x: (x-x.mean())/x.std())"],
    modelAnswer: `import pandas as pd\nimport numpy as np\n\ndef financial_analysis(df):\n    # df has MultiIndex (date, ticker), column 'close'\n    \n    # 1. Daily returns\n    df['return'] = df.groupby(level='ticker')['close'].pct_change()\n    \n    # 2. Rolling correlation between two tickers\n    wide = df['return'].unstack('ticker')\n    rolling_corr = wide['AAPL'].rolling(30).corr(wide['MSFT'])\n    \n    # 3. Sharpe ratio ranking\n    stats = df.groupby(level='ticker')['return'].agg(['mean', 'std'])\n    stats['sharpe'] = (stats['mean'] * 252) / (stats['std'] * np.sqrt(252))\n    sharpe_ranking = stats['sharpe'].sort_values(ascending=False)\n    \n    # 4. Cross-sectional z-score\n    df['z_score'] = df.groupby(level='date')['return'].transform(\n        lambda x: (x - x.mean()) / x.std()\n    )\n    \n    return df, rolling_corr, sharpe_ranking`,
    rubric: ["Correct pct_change per ticker", "Rolling correlation via unstack", "Sharpe annualization correct (sqrt(252))", "Cross-sectional z-score per date", "MultiIndex used throughout", "No unnecessary index resets"],
    tags: ["pandas", "MultiIndex", "finance", "advanced"],
    commonMistakes: ["Not grouping by ticker for returns", "Wrong annualization factor", "Resetting index unnecessarily"] },
  { id: "py-q34", courseId: "python", topicId: "py-control", title: "Custom Iterator for Batched API Calls", difficulty: "Easy", company: "Twilio", type: "code", language: "python", estimatedMinutes: 10,
    prompt: `Write an iterator class \`BatchIterator\` that takes any iterable and yields items in batches of N.\n\n\`\`\`python\nfor batch in BatchIterator(range(10), batch_size=3):\n    print(batch)  # [0,1,2], [3,4,5], [6,7,8], [9]\n\`\`\`\n\nImplement __iter__ and __next__. Handle the last incomplete batch.`,
    hints: ["Store the source as iter(iterable)", "Accumulate items until batch_size, then yield", "StopIteration when source is exhausted AND buffer is empty"],
    modelAnswer: `class BatchIterator:\n    def __init__(self, iterable, batch_size):\n        self._iter = iter(iterable)\n        self._batch_size = batch_size\n        self._exhausted = False\n    \n    def __iter__(self):\n        return self\n    \n    def __next__(self):\n        if self._exhausted:\n            raise StopIteration\n        batch = []\n        for _ in range(self._batch_size):\n            try:\n                batch.append(next(self._iter))\n            except StopIteration:\n                self._exhausted = True\n                break\n        if not batch:\n            raise StopIteration\n        return batch`,
    rubric: ["Correct __iter__ and __next__", "Handles last incomplete batch", "StopIteration raised properly", "Works with any iterable", "Memory efficient (doesn't pre-load)"],
    tags: ["iterators", "batching", "protocols", "fundamentals"],
    commonMistakes: ["Dropping the last incomplete batch", "Loading entire iterable into memory", "Not implementing __iter__"] },
  { id: "py-q35", courseId: "python", topicId: "py-ds", title: "SQL Query Builder in Python", difficulty: "Medium", company: "dbt", type: "code", language: "python", estimatedMinutes: 18,
    prompt: `Build a SQL query builder class with fluent interface:\n\n\`\`\`python\nq = (Query('users')\n    .select('name', 'email', 'COUNT(*) as order_count')\n    .join('orders', 'users.id = orders.user_id')\n    .where('users.active = true')\n    .where('orders.amount > 100')\n    .group_by('name', 'email')\n    .having('COUNT(*) > 5')\n    .order_by('order_count DESC')\n    .limit(10))\nprint(q.build())  # Returns the SQL string\n\`\`\``,
    hints: ["Store clauses as lists, join them in build()", "WHERE conditions should be ANDed together", "Return self from every method for chaining"],
    modelAnswer: `class Query:\n    def __init__(self, table):\n        self._table = table\n        self._selects = []\n        self._joins = []\n        self._wheres = []\n        self._group_bys = []\n        self._havings = []\n        self._order_bys = []\n        self._limit_val = None\n    \n    def select(self, *cols):\n        self._selects.extend(cols)\n        return self\n    \n    def join(self, table, on, join_type='INNER'):\n        self._joins.append(f"{join_type} JOIN {table} ON {on}")\n        return self\n    \n    def left_join(self, table, on):\n        return self.join(table, on, 'LEFT')\n    \n    def where(self, condition):\n        self._wheres.append(condition)\n        return self\n    \n    def group_by(self, *cols):\n        self._group_bys.extend(cols)\n        return self\n    \n    def having(self, condition):\n        self._havings.append(condition)\n        return self\n    \n    def order_by(self, *cols):\n        self._order_bys.extend(cols)\n        return self\n    \n    def limit(self, n):\n        self._limit_val = n\n        return self\n    \n    def build(self):\n        parts = []\n        parts.append(f"SELECT {', '.join(self._selects) if self._selects else '*'}")\n        parts.append(f"FROM {self._table}")\n        for j in self._joins: parts.append(j)\n        if self._wheres: parts.append(f"WHERE {' AND '.join(self._wheres)}")\n        if self._group_bys: parts.append(f"GROUP BY {', '.join(self._group_bys)}")\n        if self._havings: parts.append(f"HAVING {' AND '.join(self._havings)}")\n        if self._order_bys: parts.append(f"ORDER BY {', '.join(self._order_bys)}")\n        if self._limit_val: parts.append(f"LIMIT {self._limit_val}")\n        return '\\n'.join(parts)`,
    rubric: ["Fluent chaining (every method returns self)", "Correct SQL clause ordering", "Multiple WHERE conditions ANDed", "JOIN support with type", "GROUP BY + HAVING", "ORDER BY + LIMIT", "build() produces valid SQL"],
    tags: ["fluent-interface", "SQL", "OOP", "builder-pattern"],
    commonMistakes: ["Wrong clause ordering in output", "Forgetting to return self", "Not handling empty selects (should default to *)"] },
  { id: "py-q36", courseId: "python", topicId: "py-basics", title: "Implement defaultdict from Scratch", difficulty: "Easy", company: "Teaching", type: "code", language: "python", estimatedMinutes: 10,
    prompt: `Implement your own \`DefaultDict\` that behaves like collections.defaultdict:\n1. Takes a factory function (e.g., int, list, dict)\n2. Returns factory() for missing keys\n3. Supports all normal dict operations\n4. __repr__ shows the default_factory`,
    hints: ["Inherit from dict", "Override __missing__ — called when __getitem__ doesn't find the key", "Factory is called with no arguments"],
    modelAnswer: `class DefaultDict(dict):\n    def __init__(self, default_factory=None, *args, **kwargs):\n        super().__init__(*args, **kwargs)\n        self.default_factory = default_factory\n    \n    def __missing__(self, key):\n        if self.default_factory is None:\n            raise KeyError(key)\n        value = self.default_factory()\n        self[key] = value\n        return value\n    \n    def __repr__(self):\n        return f"DefaultDict({self.default_factory}, {dict.__repr__(self)})"`,
    rubric: ["Inherits from dict", "__missing__ hook used", "Calls factory with no args", "Stores the default value", "Handles None factory (raises KeyError)", "Clean repr"],
    tags: ["data-structures", "OOP", "dunder-methods", "from-scratch"],
    commonMistakes: ["Not storing the created value back in the dict", "Not handling None factory", "Overriding __getitem__ instead of __missing__"] },
  { id: "py-q37", courseId: "python", topicId: "py-ds", title: "DataFrame Profiler", difficulty: "Easy", company: "Pandas Profiling", type: "code", language: "python", estimatedMinutes: 12,
    prompt: `Build a function \`profile_dataframe(df)\` that returns a comprehensive report dict:\n- shape, memory_usage_mb\n- Per column: dtype, null_count, null_pct, unique_count, unique_pct\n- For numeric: mean, median, std, min, max, skewness\n- For categorical: top_5_values with counts, is_potential_id (unique_pct > 95%)\n- Warnings: columns with >50% nulls, constant columns, high-cardinality strings`,
    hints: ["df.memory_usage(deep=True).sum() for accurate memory", "df[col].skew() for skewness", "value_counts().head(5) for top values"],
    modelAnswer: `import pandas as pd\nimport numpy as np\n\ndef profile_dataframe(df):\n    report = {'shape': df.shape, 'memory_mb': round(df.memory_usage(deep=True).sum() / 1e6, 2), 'columns': {}, 'warnings': []}\n    \n    for col in df.columns:\n        info = {'dtype': str(df[col].dtype), 'null_count': int(df[col].isna().sum()), 'null_pct': round(df[col].isna().mean() * 100, 1), 'unique_count': int(df[col].nunique()), 'unique_pct': round(df[col].nunique() / len(df) * 100, 1)}\n        \n        if pd.api.types.is_numeric_dtype(df[col]):\n            info.update({'mean': round(df[col].mean(), 2), 'median': round(df[col].median(), 2), 'std': round(df[col].std(), 2), 'min': df[col].min(), 'max': df[col].max(), 'skewness': round(df[col].skew(), 2)})\n        else:\n            top5 = df[col].value_counts().head(5).to_dict()\n            info['top_5_values'] = top5\n            info['is_potential_id'] = info['unique_pct'] > 95\n        \n        if info['null_pct'] > 50: report['warnings'].append(f"'{col}': {info['null_pct']}% null")\n        if info['unique_count'] <= 1: report['warnings'].append(f"'{col}': constant column")\n        \n        report['columns'][col] = info\n    return report`,
    rubric: ["Shape and memory reported", "Per-column stats for both types", "Numeric: mean, median, std, skew", "Categorical: top values, ID detection", "Warnings generated", "Clean dict output"],
    tags: ["pandas", "EDA", "profiling", "data-quality"],
    commonMistakes: ["Using shallow memory_usage", "Not distinguishing numeric vs categorical", "Forgetting skewness"] },
  { id: "py-q38", courseId: "python", topicId: "py-control", title: "Memoization Decorator", difficulty: "Easy", company: "Teaching", type: "code", language: "python", estimatedMinutes: 10,
    prompt: `Implement a \`@memoize\` decorator that caches function results:\n1. Cache based on all positional and keyword arguments\n2. Add a .cache_info() method showing hits, misses, cache size\n3. Add a .cache_clear() method\n4. Handle unhashable arguments gracefully (skip caching, just call the function)`,
    hints: ["Use a dict with (args, frozenset(kwargs.items())) as key", "Try/except TypeError for unhashable args", "Attach methods to the wrapper function"],
    modelAnswer: `import functools\n\ndef memoize(func):\n    cache = {}\n    hits = [0]\n    misses = [0]\n    \n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        try:\n            key = (args, frozenset(kwargs.items()))\n            if key in cache:\n                hits[0] += 1\n                return cache[key]\n            misses[0] += 1\n            result = func(*args, **kwargs)\n            cache[key] = result\n            return result\n        except TypeError:  # Unhashable args\n            return func(*args, **kwargs)\n    \n    def cache_info():\n        return {'hits': hits[0], 'misses': misses[0], 'size': len(cache)}\n    \n    def cache_clear():\n        cache.clear()\n        hits[0] = misses[0] = 0\n    \n    wrapper.cache_info = cache_info\n    wrapper.cache_clear = cache_clear\n    return wrapper`,
    rubric: ["Caches based on args+kwargs", "Hit/miss tracking", "cache_info() returns stats", "cache_clear() works", "Handles unhashable args", "functools.wraps preserves metadata"],
    tags: ["decorators", "memoization", "caching", "performance"],
    commonMistakes: ["Not handling unhashable arguments", "Mutable default for hits/misses counter", "Forgetting kwargs in cache key"] },
  { id: "py-q39", courseId: "python", topicId: "py-oop", title: "Singleton Database Pool", difficulty: "Medium", company: "Instagram", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `Implement a thread-safe Singleton connection pool:\n1. Only one instance ever created\n2. Thread-safe creation (use threading.Lock)\n3. Pool of N connections, get() and release() with timeout\n4. Context manager support: with pool.connection() as conn:\n5. Health check: periodically validate connections`,
    hints: ["__new__ with a class-level _instance", "threading.Lock for thread safety", "queue.Queue is already thread-safe for the pool"],
    modelAnswer: `import threading\nimport queue\nfrom contextlib import contextmanager\n\nclass ConnectionPool:\n    _instance = None\n    _lock = threading.Lock()\n    \n    def __new__(cls, *args, **kwargs):\n        if cls._instance is None:\n            with cls._lock:\n                if cls._instance is None:\n                    cls._instance = super().__new__(cls)\n        return cls._instance\n    \n    def __init__(self, pool_size=5):\n        if hasattr(self, '_initialized'): return\n        self._pool = queue.Queue(maxsize=pool_size)\n        for i in range(pool_size):\n            self._pool.put({'id': i, 'status': 'open'})\n        self._initialized = True\n    \n    def get(self, timeout=5):\n        try:\n            return self._pool.get(timeout=timeout)\n        except queue.Empty:\n            raise TimeoutError("No connections available")\n    \n    def release(self, conn):\n        self._pool.put(conn)\n    \n    @contextmanager\n    def connection(self):\n        conn = self.get()\n        try:\n            yield conn\n        finally:\n            self.release(conn)`,
    rubric: ["Singleton via __new__", "Double-checked locking", "Thread-safe pool (Queue)", "get with timeout", "Context manager for auto-release", "Prevents re-initialization"],
    tags: ["singleton", "threading", "connection-pool", "design-patterns", "OOP"],
    commonMistakes: ["Race condition in singleton creation", "Not using double-checked locking", "Forgetting to release on exception"] },
  { id: "py-q40", courseId: "python", topicId: "py-ds", title: "End-to-End EDA Report Generator", difficulty: "Hard", company: "Jupyter", type: "code", language: "python", estimatedMinutes: 25,
    prompt: `Build a function \`generate_eda_report(df, target_col=None)\` that produces a comprehensive EDA:\n\n1. Dataset overview: shape, types, memory, duplicates\n2. Missing value analysis: heatmap data, patterns (MCAR/MAR/MNAR suggestions)\n3. Univariate: distribution stats for all columns, skewness flags\n4. Bivariate: correlations, top correlated pairs, target variable analysis if provided\n5. Outlier detection: IQR method, flag columns with >5% outliers\n6. Return as a structured dict that could be rendered as a report\n\nThis should work on ANY DataFrame without configuration.`,
    hints: ["Separate handling for numeric vs categorical", "Correlation of nulls with other columns hints at MAR", "Use IQR: outlier if < Q1-1.5*IQR or > Q3+1.5*IQR"],
    modelAnswer: `import pandas as pd\nimport numpy as np\n\ndef generate_eda_report(df, target_col=None):\n    report = {}\n    \n    # 1. Overview\n    report['overview'] = {\n        'shape': df.shape, 'memory_mb': round(df.memory_usage(deep=True).sum()/1e6, 2),\n        'duplicated_rows': int(df.duplicated().sum()),\n        'dtypes': df.dtypes.value_counts().to_dict(),\n    }\n    \n    # 2. Missing values\n    nulls = df.isnull().sum()\n    null_cols = nulls[nulls > 0]\n    report['missing'] = {\n        'total_missing_cells': int(nulls.sum()),\n        'pct_missing': round(nulls.sum() / df.size * 100, 2),\n        'columns': {col: {'count': int(v), 'pct': round(v/len(df)*100, 1)} for col, v in null_cols.items()},\n    }\n    \n    # 3. Univariate\n    report['univariate'] = {}\n    for col in df.columns:\n        if pd.api.types.is_numeric_dtype(df[col]):\n            s = df[col].dropna()\n            report['univariate'][col] = {\n                'type': 'numeric', 'mean': round(s.mean(), 3), 'median': round(s.median(), 3),\n                'std': round(s.std(), 3), 'skew': round(s.skew(), 3),\n                'is_skewed': abs(s.skew()) > 1,\n            }\n        else:\n            report['univariate'][col] = {\n                'type': 'categorical', 'unique': int(df[col].nunique()),\n                'top_3': df[col].value_counts().head(3).to_dict(),\n            }\n    \n    # 4. Bivariate\n    num_cols = df.select_dtypes(include='number').columns\n    if len(num_cols) > 1:\n        corr = df[num_cols].corr()\n        pairs = []\n        for i in range(len(num_cols)):\n            for j in range(i+1, len(num_cols)):\n                pairs.append((num_cols[i], num_cols[j], round(corr.iloc[i,j], 3)))\n        pairs.sort(key=lambda x: abs(x[2]), reverse=True)\n        report['correlations'] = {'top_pairs': pairs[:10]}\n    \n    if target_col and target_col in df.columns:\n        report['target_analysis'] = {\n            'distribution': df[target_col].value_counts().head(10).to_dict() if df[target_col].dtype == 'object'\n            else {'mean': round(df[target_col].mean(), 3), 'std': round(df[target_col].std(), 3)}\n        }\n    \n    # 5. Outliers\n    report['outliers'] = {}\n    for col in num_cols:\n        Q1, Q3 = df[col].quantile(0.25), df[col].quantile(0.75)\n        IQR = Q3 - Q1\n        outlier_mask = (df[col] < Q1 - 1.5*IQR) | (df[col] > Q3 + 1.5*IQR)\n        pct = round(outlier_mask.mean() * 100, 1)\n        if pct > 0:\n            report['outliers'][col] = {'count': int(outlier_mask.sum()), 'pct': pct, 'flagged': pct > 5}\n    \n    return report`,
    rubric: ["Comprehensive overview section", "Missing value analysis", "Univariate stats for both types", "Correlation analysis with top pairs", "Target variable analysis if provided", "IQR outlier detection", "Works on any DataFrame without config", "Structured dict output"],
    tags: ["EDA", "pandas", "data-quality", "profiling", "automation"],
    commonMistakes: ["Not handling mixed types", "Correlation on non-numeric columns", "Not handling empty DataFrame"] },
  { id: "py-q41", courseId: "python", topicId: "py-control", title: "Async API Ingestion with Rate Limiting + Retries", difficulty: "Hard", company: "Stripe", type: "code", language: "python", estimatedMinutes: 24,
    prompt: `Build an async ingestion utility for a paginated HTTP API under strict limits:\n\nConstraints:\n- API rate limit: max 5 requests/second\n- Transient failures: 429 and 5xx should be retried with exponential backoff + jitter\n- Hard failures (4xx except 429): do not retry\n- Pagination uses a \`next_cursor\` token returned in JSON\n\nImplement:\n1. \`async fetch_page(session, cursor=None)\` that returns JSON data\n2. \`async ingest_all(base_url)\` that fetches all pages and returns one flattened list of records\n3. Concurrency control using asyncio primitives (Semaphore and/or token bucket style)\n4. Retry policy with max_retries=5 and backoff cap\n5. Basic observability: return stats dict (requests, retries, failures, elapsed_seconds)\n\nWrite production-style code with clear separation of concerns.`,
    hints: ["Use asyncio.Semaphore to cap in-flight calls and a timing gate for per-second rate limit", "Retry only for retryable status codes; stop immediately for hard 4xx", "Use asyncio.get_running_loop().time() for stable elapsed timing"],
    modelAnswer: `import asyncio\nimport aiohttp\nimport random\nfrom time import perf_counter\n\nclass RetryableHTTPError(Exception):\n    pass\n\nclass FatalHTTPError(Exception):\n    pass\n\nclass RateLimiter:\n    \"\"\"Simple token-spacing limiter: at most N acquisitions per second.\"\"\"\n    def __init__(self, rate_per_sec: int):\n        self._min_interval = 1.0 / rate_per_sec\n        self._lock = asyncio.Lock()\n        self._next_allowed = 0.0\n\n    async def acquire(self):\n        loop = asyncio.get_running_loop()\n        async with self._lock:\n            now = loop.time()\n            wait = self._next_allowed - now\n            if wait > 0:\n                await asyncio.sleep(wait)\n                now = loop.time()\n            self._next_allowed = now + self._min_interval\n\nasync def fetch_page(session, url, limiter, cursor=None, max_retries=5):\n    params = {'cursor': cursor} if cursor else {}\n    attempt = 0\n\n    while True:\n        await limiter.acquire()\n        try:\n            async with session.get(url, params=params, timeout=20) as resp:\n                if resp.status == 429 or 500 <= resp.status <= 599:\n                    raise RetryableHTTPError(f\"retryable status={resp.status}\")\n                if 400 <= resp.status <= 499:\n                    body = await resp.text()\n                    raise FatalHTTPError(f\"fatal status={resp.status} body={body[:200]}\")\n                return await resp.json()\n\n        except (aiohttp.ClientError, asyncio.TimeoutError, RetryableHTTPError):\n            if attempt >= max_retries:\n                raise\n            # Exponential backoff with jitter and cap\n            delay = min(8.0, (2 ** attempt) * 0.25) + random.uniform(0, 0.2)\n            await asyncio.sleep(delay)\n            attempt += 1\n\nasync def ingest_all(base_url):\n    started = perf_counter()\n    stats = {'requests': 0, 'retries': 0, 'failures': 0, 'elapsed_seconds': 0.0}\n    limiter = RateLimiter(rate_per_sec=5)\n    records = []\n    cursor = None\n\n    connector = aiohttp.TCPConnector(limit=20)\n    timeout = aiohttp.ClientTimeout(total=30)\n    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:\n        while True:\n            try:\n                data = await fetch_page(session, base_url, limiter, cursor=cursor)\n                stats['requests'] += 1\n            except Exception:\n                stats['failures'] += 1\n                break\n\n            page_records = data.get('records', [])\n            records.extend(page_records)\n\n            next_cursor = data.get('next_cursor')\n            # optional metadata from API if present\n            stats['retries'] += int(data.get('meta', {}).get('retries', 0))\n            if not next_cursor:\n                break\n            cursor = next_cursor\n\n    stats['elapsed_seconds'] = round(perf_counter() - started, 3)\n    return records, stats`,
    rubric: ["Async HTTP flow with aiohttp", "Rate limiting at 5 req/s", "Retry logic for 429/5xx + timeout/client errors", "No retries for hard 4xx", "Pagination loop via next_cursor", "Exponential backoff with jitter + cap", "Operational stats returned", "Readable production-style structure"],
    tags: ["asyncio", "aiohttp", "rate-limiting", "retries", "pagination", "resilience"],
    commonMistakes: ["Retrying all 4xx (should not)", "No jitter causing synchronized retry storms", "Blocking with time.sleep in async code", "Ignoring pagination termination condition"] },
];
