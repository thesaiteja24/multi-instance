export const mockData = {
  exam: {
    batch: 'PFS-101',
    examId: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    examName: 'Daily-Exam',
    location: 'vijayawada',
    paper: [
      {
        Coding: [
          {
            Constraints:
              'Take an integer n (1 <= n <= 100), check if it is greater than 50',
            Difficulty: 'Easy',
            Hidden_Test_Cases: [
              { Input: '75', Output: '75 is greater than 50' },
              { Input: '25', Output: '25 is not greater than 50' },
              { Input: '50', Output: '50 is not greater than 50' },
              { Input: '100', Output: '100 is greater than 50' },
            ],
            Question: 'Write a program to check if a number is greater than 50',
            Question_No: 1,
            Question_Type: 'code',
            Sample_Input: '60',
            Sample_Output: '60 is greater than 50',
            Score: 5,
            Subject: 'python',
            Tags: 'day-11:1',
            questionId: 'py-code-101',
          },
          {
            Constraints:
              'Take an integer n (1 <= n <= 10), print a square of n rows and n columns with stars',
            Difficulty: 'Easy',
            Hidden_Test_Cases: [
              { Input: '3', Output: '***\n***\n***' },
              { Input: '5', Output: '*****\n*****\n*****\n*****\n*****' },
              { Input: '1', Output: '*' },
              { Input: '2', Output: '**\n**' },
            ],
            Question: 'Write a program to print a square star pattern',
            Question_No: 2,
            Question_Type: 'code',
            Sample_Input: '4',
            Sample_Output: '****\n****\n****\n****',
            Score: 5,
            Subject: 'python',
            Tags: 'day-13:1',
            questionId: 'py-code-102',
          },
          {
            Constraints:
              'Take an integer n (1 <= n <= 100), check if it is divisible by 7',
            Difficulty: 'Easy',
            Hidden_Test_Cases: [
              { Input: '14', Output: 'Divisible by 7' },
              { Input: '15', Output: 'Not divisible by 7' },
              { Input: '49', Output: 'Divisible by 7' },
              { Input: '8', Output: 'Not divisible by 7' },
            ],
            Question: 'Write a program to check if a number is divisible by 7',
            Question_No: 3,
            Question_Type: 'code',
            Sample_Input: '21',
            Sample_Output: 'Divisible by 7',
            Score: 5,
            Subject: 'python',
            Tags: 'day-11:2',
            questionId: 'py-code-103',
          },
          {
            Constraints:
              'Take an integer n (1 <= n <= 10), print a right triangle with n rows',
            Difficulty: 'Easy',
            Hidden_Test_Cases: [
              { Input: '3', Output: '*\n**\n***' },
              { Input: '5', Output: '*\n**\n***\n****\n*****' },
              { Input: '1', Output: '*' },
              { Input: '2', Output: '*\n**' },
            ],
            Question: 'Write a program to print a right triangle star pattern',
            Question_No: 4,
            Question_Type: 'code',
            Sample_Input: '4',
            Sample_Output: '*\n**\n***\n****',
            Score: 5,
            Subject: 'python',
            Tags: 'day-13:2',
            questionId: 'py-code-104',
          },
          {
            Constraints:
              'Take two integers a and b (1 <= a, b <= 1000), print their product',
            Difficulty: 'Easy',
            Hidden_Test_Cases: [
              { Input: '10 5', Output: '50' },
              { Input: '3 4', Output: '12' },
              { Input: '100 2', Output: '200' },
              { Input: '1 1', Output: '1' },
            ],
            Question: 'Write a program to find the product of two numbers',
            Question_No: 5,
            Question_Type: 'code',
            Sample_Input: '6 7',
            Sample_Output: '42',
            Score: 5,
            Subject: 'python',
            Tags: 'day-11:3',
            questionId: 'py-code-105',
          },
        ],
        MCQs: [
          {
            Correct_Option: 'B',
            Difficulty: 'Easy',
            Options: {
              A: 'Assignment',
              B: 'Equality comparison',
              C: 'Inequality',
              D: 'Greater than',
            },
            Question: 'What does the == operator do in Python?',
            Question_No: 1,
            Question_Type: 'mcq',
            Score: 1,
            Subject: 'python',
            Tags: 'day-11:1',
            questionId: 'py-mcq-101',
          },
          {
            Correct_Option: 'C',
            Difficulty: 'Easy',
            Options: {
              A: 'Curly braces {}',
              B: 'Parentheses ()',
              C: 'Indentation',
              D: 'Semicolons ;',
            },
            Question:
              'How does Python identify the code block of an if statement?',
            Question_No: 2,
            Question_Type: 'mcq',
            Score: 1,
            Subject: 'python',
            Tags: 'day-11:1',
            questionId: 'py-mcq-102',
          },
          {
            Correct_Option: 'A',
            Difficulty: 'Easy',
            Options: {
              A: 'print',
              B: 'input',
              C: 'write',
              D: 'display',
            },
            Question: 'Which function outputs text to the console in Python?',
            Question_No: 3,
            Question_Type: 'mcq',
            Score: 1,
            Subject: 'python',
            Tags: 'day-11:2',
            questionId: 'py-mcq-103',
          },
          {
            Correct_Option: 'B',
            Difficulty: 'Easy',
            Options: {
              A: 'for',
              B: 'range',
              C: 'while',
              D: 'loop',
            },
            Question:
              'Which function generates a sequence of numbers for a for loop?',
            Question_No: 4,
            Question_Type: 'mcq',
            Score: 1,
            Subject: 'python',
            Tags: 'day-13:1',
            questionId: 'py-mcq-104',
          },
          {
            Correct_Option: 'C',
            Difficulty: 'Easy',
            Options: {
              A: '%',
              B: '/',
              C: '//',
              D: '**',
            },
            Question: 'Which operator performs integer division in Python?',
            Question_No: 5,
            Question_Type: 'mcq',
            Score: 1,
            Subject: 'python',
            Tags: 'day-11:2',
            questionId: 'py-mcq-105',
          },
        ],
        subject: 'Python',
        totalTime: 30,
      },
      {
        Coding: [
          {
            Constraints:
              'Take two integers p and r (1 <= p, r <= 100), calculate p percent of r',
            Difficulty: 'Easy',
            Hidden_Test_Cases: [
              { Input: '10 200', Output: '20' },
              { Input: '25 100', Output: '25' },
              { Input: '50 50', Output: '25' },
              { Input: '5 80', Output: '4' },
            ],
            Question: 'Write a program to calculate p percent of a number r',
            Question_No: 1,
            Question_Type: 'code',
            Sample_Input: '20 50',
            Sample_Output: '10',
            Score: 5,
            Subject: 'aptitude',
            Tags: 'day-14:1',
            questionId: 'apt-code-101',
          },
          {
            Constraints:
              'Take an integer n (1 <= n <= 1000), find the sum of its digits',
            Difficulty: 'Easy',
            Hidden_Test_Cases: [
              { Input: '123', Output: '6' },
              { Input: '45', Output: '9' },
              { Input: '7', Output: '7' },
              { Input: '100', Output: '1' },
            ],
            Question: 'Write a program to find the sum of digits of a number',
            Question_No: 2,
            Question_Type: 'code',
            Sample_Input: '234',
            Sample_Output: '9',
            Score: 5,
            Subject: 'aptitude',
            Tags: 'day-14:2',
            questionId: 'apt-code-102',
          },
          {
            Constraints:
              'Take three integers a, b, c (1 <= a, b, c <= 100), find their average',
            Difficulty: 'Easy',
            Hidden_Test_Cases: [
              { Input: '10 20 30', Output: '20' },
              { Input: '5 5 5', Output: '5' },
              { Input: '1 2 3', Output: '2' },
              { Input: '50 50 50', Output: '50' },
            ],
            Question: 'Write a program to find the average of three numbers',
            Question_No: 3,
            Question_Type: 'code',
            Sample_Input: '15 25 35',
            Sample_Output: '25',
            Score: 5,
            Subject: 'aptitude',
            Tags: 'day-14:3',
            questionId: 'apt-code-103',
          },
          {
            Constraints:
              'Take an integer n (1 <= n <= 100), find the next number in the sequence: n, n+2, n+4, ...',
            Difficulty: 'Easy',
            Hidden_Test_Cases: [
              { Input: '5', Output: '11' },
              { Input: '1', Output: '3' },
              { Input: '10', Output: '16' },
              { Input: '2', Output: '4' },
            ],
            Question:
              'Write a program to find the next number in the sequence starting from n with a common difference of 2',
            Question_No: 4,
            Question_Type: 'code',
            Sample_Input: '3',
            Sample_Output: '5',
            Score: 5,
            Subject: 'aptitude',
            Tags: 'day-14:4',
            questionId: 'apt-code-104',
          },
          {
            Constraints:
              'Take an integer n (1 <= n <= 1000), check if it is a perfect square',
            Difficulty: 'Easy',
            Hidden_Test_Cases: [
              { Input: '16', Output: 'Yes' },
              { Input: '15', Output: 'No' },
              { Input: '25', Output: 'Yes' },
              { Input: '10', Output: 'No' },
            ],
            Question:
              'Write a program to check if a number is a perfect square',
            Question_No: 5,
            Question_Type: 'code',
            Sample_Input: '9',
            Sample_Output: 'Yes',
            Score: 5,
            Subject: 'aptitude',
            Tags: 'day-14:5',
            questionId: 'apt-code-105',
          },
        ],
        MCQs: [
          {
            Correct_Option: 'C',
            Difficulty: 'Easy',
            Options: {
              A: '10',
              B: '15',
              C: '20',
              D: '25',
            },
            Question: 'What is 25% of 80?',
            Question_No: 1,
            Question_Type: 'mcq',
            Score: 1,
            Subject: 'aptitude',
            Tags: 'day-14:1',
            questionId: 'apt-mcq-101',
          },
          {
            Correct_Option: 'B',
            Difficulty: 'Easy',
            Options: {
              A: '5',
              B: '6',
              C: '7',
              D: '8',
            },
            Question:
              'What is the next number in the sequence: 2, 4, 6, 8, ...?',
            Question_No: 2,
            Question_Type: 'mcq',
            Score: 1,
            Subject: 'aptitude',
            Tags: 'day-14:2',
            questionId: 'apt-mcq-102',
          },
          {
            Correct_Option: 'A',
            Difficulty: 'Easy',
            Options: {
              A: '15',
              B: '20',
              C: '25',
              D: '30',
            },
            Question: 'What is the average of 10, 15, and 20?',
            Question_No: 3,
            Question_Type: 'mcq',
            Score: 1,
            Subject: 'aptitude',
            Tags: 'day-14:3',
            questionId: 'apt-mcq-103',
          },
          {
            Correct_Option: 'C',
            Difficulty: 'Easy',
            Options: {
              A: '3',
              B: '4',
              C: '5',
              D: '6',
            },
            Question:
              'If a number is divisible by both 2 and 3, it is divisible by what?',
            Question_No: 4,
            Question_Type: 'mcq',
            Score: 1,
            Subject: 'aptitude',
            Tags: 'day-14:4',
            questionId: 'apt-mcq-104',
          },
          {
            Correct_Option: 'B',
            Difficulty: 'Easy',
            Options: {
              A: '10',
              B: '12',
              C: '14',
              D: '16',
            },
            Question:
              'What is the sum of the first three even numbers starting from 2?',
            Question_No: 5,
            Question_Type: 'mcq',
            Score: 1,
            Subject: 'aptitude',
            Tags: 'day-14:5',
            questionId: 'apt-mcq-105',
          },
        ],
        subject: 'Aptitude',
        totalTime: 30,
      },
    ],
    startDate: '2025-06-02',
    startTime: '09:00',
    studentId: '456f7890-a1b2-3c4d-5e6f-789012345678',
    subjects: [
      {
        selectedCoding: { easy: 5, hard: 0, medium: 0 },
        selectedMCQs: { easy: 5, hard: 0, medium: 0 },
        subject: 'Python',
        tags: ['day-11:1', 'day-11:2', 'day-11:3', 'day-13:1', 'day-13:2'],
        totalTime: 30,
      },
      {
        selectedCoding: { easy: 5, hard: 0, medium: 0 },
        selectedMCQs: { easy: 5, hard: 0, medium: 0 },
        subject: 'Aptitude',
        tags: ['day-14:1', 'day-14:2', 'day-14:3', 'day-14:4', 'day-14:5'],
        totalTime: 30,
      },
    ],
    totalExamTime: 30,
  },
  success: true,
};
