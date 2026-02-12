
import { Language } from './types';

export const SUPPORTED_LANGUAGES = [
  { id: Language.Python, name: 'Python' },
  { id: Language.JavaScript, name: 'JavaScript' },
  { id: Language.Java, name: 'Java' },
  { id: Language.CPP, name: 'C++' },
];

export const SAMPLE_CODE: Record<Language, string> = {
  [Language.Python]: `def calculate_average(numbers):
    total = 0
    for n in numbers:
        total += n
    return total / len(numbers)

# Vulnerable code example
import sqlite3
def get_user(user_id):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # SQL Injection risk
    query = "SELECT * FROM users WHERE id = " + user_id
    cursor.execute(query)
    return cursor.fetchone()`,

  [Language.JavaScript]: `function processData(items) {
  let result = [];
  for (var i = 0; i < items.length; i++) {
    // Heavy operation inside loop
    let processed = items[i].data.map(x => x * 2).filter(x => x > 10);
    result.push(processed);
  }
  return result;
}`,

  [Language.Java]: `public class Calculator {
    public int divide(int a, int b) {
        return a / b; // No zero check
    }
}`,
  [Language.CPP]: `#include <iostream>
int main() {
    int* ptr = new int(10);
    std::cout << *ptr << std::endl;
    // Memory leak
    return 0;
}`
};
