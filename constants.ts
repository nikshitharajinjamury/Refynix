
import { Language } from './types';

export const SUPPORTED_LANGUAGES = [
  { id: Language.Python, name: 'Python' },
  { id: Language.JavaScript, name: 'JavaScript' },
  { id: Language.TypeScript, name: 'TypeScript' },
  { id: Language.Java, name: 'Java' },
  { id: Language.CPP, name: 'C++' },
  { id: Language.Go, name: 'Go' },
  // Added missing Rust language
  { id: Language.Rust, name: 'Rust' },
];

// Added missing Rust sample to satisfy the Record<Language, string> type
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
  [Language.TypeScript]: `interface User { id: number; name: string; }
function fetchUser(id: any) {
    return fetch('/api/users/' + id).then(r => r.json());
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
}`,
  [Language.Go]: `package main
func sum(nums []int) int {
    s := 0
    for _, n := range nums {
        s += n
    }
    return s
}`,
  [Language.Rust]: `fn main() {
    let mut vec = Vec::new();
    vec.push(1);
    vec.push(2);
    // Potential issue: unused variable
    let x = 5;
    println!("{:?}", vec);
}`
};
