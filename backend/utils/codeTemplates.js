const codeTemplates = {
  python: {
    name: "Python Hello World",
    code: `# Basic Python program
def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  },
  javascript: {
    name: "JavaScript Hello World",
    code: `// Basic JavaScript program
function main() {
    console.log("Hello, World!");
}

main();`,
  },
  java: {
    name: "Java Hello World",
    code: `// Basic Java program
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  },
  cpp: {
    name: "C++ Hello World",
    code: `// Basic C++ program
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  },
  c: {
    name: "C Hello World",
    code: `// Basic C program
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  },
  go: {
    name: "Go Hello World",
    code: `// Basic Go program
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
  },
  rust: {
    name: "Rust Hello World",
    code: `// Basic Rust program
fn main() {
    println!("Hello, World!");
}`,
  },
  typescript: {
    name: "TypeScript Hello World",
    code: `// Basic TypeScript program
function main(): void {
    console.log("Hello, World!");
}

main();`,
  },
  php: {
    name: "PHP Hello World",
    code: `<?php
// Basic PHP program
function main() {
    echo "Hello, World!\\n";
}

main();
?>`,
  },
  ruby: {
    name: "Ruby Hello World",
    code: `# Basic Ruby program
def main
    puts "Hello, World!"
end

main`,
  },
  kotlin: {
    name: "Kotlin Hello World",
    code: `// Basic Kotlin program
fun main() {
    println("Hello, World!")
}`,
  },
  swift: {
    name: "Swift Hello World",
    code: `// Basic Swift program
import Foundation

func main() {
    print("Hello, World!")
}

main()`,
  },
  csharp: {
    name: "C# Hello World",
    code: `// Basic C# program
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
  },
  sql: {
    name: "SQL Basic Query",
    code: `-- Basic SQL query
-- Create a sample table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE
);

-- Insert sample data
INSERT OR IGNORE INTO users (name, email) VALUES 
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com');

-- Query the data
SELECT * FROM users;`,
  },
};

export default codeTemplates;
