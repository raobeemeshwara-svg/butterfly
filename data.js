/* CampusHub — demo seed data (ported from the original FastAPI seed.py).
   All demo accounts use the password: campus123 */
window.CH_SEED = function () {
  const day = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const DEMO_HASH = "demo:campus123"; // replaced by a real SHA-256 on first load (see app.js)

  const teachers = [
    { id: 1, code: "T001", name: "Dr. K. Sharma", email: "sharma@university.edu", pw: DEMO_HASH, dept: "Computer Science", title: "Professor & HOD", bio: "Head of the Computer Science department. Specialises in operating systems and distributed computing." },
    { id: 2, code: "T002", name: "Prof. Priya Nair", email: "priya.nair@university.edu", pw: DEMO_HASH, dept: "Computer Science", title: "Assistant Professor", bio: "Teaches database systems, data engineering and algorithm design." },
  ];

  const mk = (id, code, name, email, bio, phone, address) => ({
    id, code, name, email, pw: DEMO_HASH, dept: "Computer Science", year: 2, semester: 4, bio, phone, address,
  });
  const students = [
    mk(1, "STU-2024-001", "Alex Johnson", "alex.johnson@university.edu", "Second-year CS student interested in software engineering and data structures.", "+1 (555) 012-3456", "123 Campus Drive, University Town"),
    mk(2, "ST002", "Ananya Reddy", "ananya.reddy@university.edu", "Interested in machine learning and full-stack web development.", "+91 98765 43211", "University Enclave, Flat 201"),
    mk(3, "ST003", "Rahul Kumar", "rahul.kumar@university.edu", "Focused on databases, cloud platforms and open source.", "+91 98765 43212", "Campus Hostel Block A, Room 112"),
    mk(4, "ST004", "Sneha Rao", "sneha.rao@university.edu", "Passionate about networks, cyber security and hackathons.", "+91 98765 43213", "North Campus Hall, Room 408"),
    mk(5, "ST005", "Arjun Reddy", "arjun.reddy@university.edu", "Enthusiastic about algorithms, mobile apps and robotics.", "+91 98765 43214", "Campus Hostel Block C, Room 215"),
  ];

  const courses = [
    { id: 1, code: "CS301", name: "Operating Systems", dept: "Computer Science", teacherId: 1 },
    { id: 2, code: "CS302", name: "Database Management Systems", dept: "Computer Science", teacherId: 2 },
    { id: 3, code: "CS303", name: "Computer Networks", dept: "Computer Science", teacherId: 1 },
    { id: 4, code: "CS304", name: "Design & Analysis of Algorithms", dept: "Computer Science", teacherId: 2 },
    { id: 5, code: "CS305L", name: "Operating Systems Lab", dept: "Computer Science", teacherId: 1 },
    { id: 6, code: "MA201", name: "Discrete Mathematics", dept: "Mathematics", teacherId: 2 },
  ];

  const enrollments = [];
  courses.forEach((c) => students.forEach((s) => enrollments.push({ studentId: s.id, courseId: c.id })));

  // Attendance: [courseId, total classes, attended by Alex]
  const specs = [[1, 30, 26], [2, 28, 22], [3, 25, 18], [4, 26, 25], [5, 12, 11], [6, 22, 15]];
  const attendance = [];
  let aid = 1;
  specs.forEach(([courseId, total, attended]) => {
    const absent = total - attended;
    const absentIdx = new Set();
    for (let i = 1; i <= absent; i++) absentIdx.add(Math.floor(i * (total / (absent + 1))));
    const dates = [];
    for (let off = -1; dates.length < total; off--) {
      const d = new Date(); d.setDate(d.getDate() + off);
      if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(d.toISOString().slice(0, 10));
    }
    dates.reverse().forEach((date, idx) => {
      students.forEach((s) => {
        const absentNow = s.id === 1 ? absentIdx.has(idx) : (idx + s.id) % 6 === 0;
        attendance.push({ id: aid++, studentId: s.id, courseId, date, status: absentNow ? "absent" : "present" });
      });
    });
  });

  const notes = [
    { id: 1, teacherId: 1, courseId: 1, title: "Process Synchronization & Semaphores — Revision Notes", content: "Critical section problem, Peterson's algorithm, TestAndSet and Swap, counting and binary semaphores, classic problems: producer-consumer and dining philosophers.", url: "https://en.wikipedia.org/wiki/Semaphore_(programming)", created: day(-2) },
    { id: 2, teacherId: 2, courseId: 2, title: "Database Normalization Quick Notes (1NF to BCNF)", content: "Functional dependencies, attribute closure, canonical cover, 1NF to BCNF with decomposition examples.", url: "https://en.wikipedia.org/wiki/Database_normalization", created: day(-4) },
    { id: 3, teacherId: 1, courseId: 3, title: "OSI Model & TCP/IP Protocol Suite", content: "All seven OSI layers, packet encapsulation, MAC versus IP addressing and the TCP three-way handshake.", url: "https://en.wikipedia.org/wiki/OSI_model", created: day(-6) },
    { id: 4, teacherId: 2, courseId: 4, title: "Dynamic Programming Memoization Guide", content: "Optimal substructure and overlapping subproblems, with walkthroughs for 0/1 knapsack, LCS and matrix chain multiplication.", url: "https://en.wikipedia.org/wiki/Dynamic_programming", created: day(-8) },
  ];

  const tasks = [
    { id: 1, studentId: 1, title: "Physics Lab Experiment", description: "Record observations for the optics experiment.", subject: "PHY201 · Physics II", due: day(-5), status: "completed", priority: "medium" },
    { id: 2, studentId: 1, title: "Operating Systems Lab Report", description: "Document the process scheduling experiment results.", subject: "CS305L · OS Lab", due: day(-2), status: "completed", priority: "high" },
    { id: 3, studentId: 1, title: "Binary Search Tree Assignment", description: "Implement insert, delete and search for a BST.", subject: "CS304 · Algorithms", due: day(3), status: "in_progress", priority: "high" },
    { id: 4, studentId: 1, title: "Discrete Maths Problem Set 5", description: "Problems 1–20 from chapter 8.", subject: "MA201 · Discrete Mathematics", due: day(6), status: "pending", priority: "medium" },
    { id: 5, studentId: 1, title: "Technical Writing Essay", description: "1,500 words on the impact of open-source software.", subject: "ENG102 · Technical Writing", due: day(10), status: "pending", priority: "low" },
    { id: 6, studentId: 1, title: "Database Design Project", description: "ER diagram and schema for a hospital management system.", subject: "CS302 · Databases", due: day(14), status: "pending", priority: "medium" },
  ];

  const events = [
    { id: 1, title: "Library Orientation for New Students", description: "Learn how to access digital journals and reserve study rooms.", location: "Central Library", date: day(1), time: "11:30 AM", category: "Academic", capacity: 60, organizer: "Library Services" },
    { id: 2, title: "Semester Opening Assembly", description: "Welcome address by the Dean of Students and an overview of semester activities.", location: "Main Auditorium", date: day(4), time: "10:00 AM", category: "Academic", capacity: 500, organizer: "Dean of Students Office" },
    { id: 3, title: "Workshop: Introduction to Machine Learning", description: "Hands-on supervised learning with Python and scikit-learn.", location: "CS Lab 3", date: day(7), time: "2:00 PM", category: "Workshop", capacity: 40, organizer: "Data Science Club" },
    { id: 4, title: "CS Department Hackathon", description: "A 24-hour hackathon. Form teams of 2–4 and ship a working project.", location: "Engineering Block, Room 204", date: day(12), time: "9:00 AM", category: "Technical", capacity: 80, organizer: "CS Student Association" },
    { id: 5, title: "Inter-College Debate Competition", description: "Regional debate on technology and society. Open registration.", location: "Seminar Hall B", date: day(15), time: "3:00 PM", category: "Cultural", capacity: 200, organizer: "Literary Society" },
    { id: 6, title: "Career Fair — Technology & Engineering", description: "Meet recruiters from 30+ companies. Bring your resume.", location: "University Sports Hall", date: day(20), time: "11:00 AM", category: "Career", capacity: 400, organizer: "Placement Cell" },
  ];
  const registrations = [{ eventId: 1, studentId: 1 }, { eventId: 3, studentId: 1 }];

  const facultyResources = [
    { id: 1, teacherId: 1, courseId: 1, title: "Operating Systems — Process Scheduling Reference", description: "CPU scheduling algorithms (FCFS, SJF, RR, priority), process states and context-switch overhead.", type: "link", url: "https://en.wikipedia.org/wiki/Scheduling_(computing)" },
    { id: 2, teacherId: 2, courseId: 2, title: "Database Indexing & B-Trees Guide", description: "B-tree and B+ tree structures, clustered versus non-clustered indexes, query tuning.", type: "document", url: "https://en.wikipedia.org/wiki/B-tree" },
    { id: 3, teacherId: 2, courseId: 4, title: "MIT OpenCourseWare — Algorithms", description: "Lecture notes, videos and problem sets from MIT 6.006.", type: "video", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/" },
    { id: 4, teacherId: 1, courseId: 3, title: "Computer Networking TCP/IP Guide", description: "TCP/IP stack, subnetting, CIDR and Wireshark walkthroughs.", type: "link", url: "https://www.ietf.org/rfc/rfc793.txt" },
  ];

  const personalResources = [
    { id: 1, studentId: 1, title: "My Python Practice", subject: "Python / LeetCode", type: "link", description: "Dynamic programming, sliding window and two-pointer problems for interview prep.", url: "https://leetcode.com/problemset/all/" },
    { id: 2, studentId: 1, title: "BST Implementation Notes", subject: "CS304 · Algorithms", type: "note", description: "Balancing patterns and recursive deletion edge cases.", url: "https://en.wikipedia.org/wiki/Binary_search_tree" },
    { id: 3, studentId: 1, title: "Integration Techniques Summary", subject: "MA201 · Discrete Mathematics", type: "note", description: "Cheat sheet: u-substitution, integration by parts, partial fractions.", url: "https://en.wikipedia.org/wiki/Integration_by_parts" },
    { id: 4, studentId: 1, title: "Web Development Documentation", subject: "Personal projects", type: "link", description: "MDN docs on React hooks, async patterns and modern JavaScript.", url: "https://developer.mozilla.org" },
  ];

  return {
    version: 1, teachers, students, courses, enrollments, attendance, notes, tasks, events,
    registrations, facultyResources, personalResources, session: null,
    settings: { theme: "light", notifications: true },
    seq: { teacher: 3, student: 6, task: 7, event: 7, note: 5, fres: 5, pres: 5, attendance: aid },
  };
};
