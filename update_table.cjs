const fs = require('fs');

const filePath = './components/ReExamTable.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update th borders and padding
content = content.replace(/className="bg-\[#21409A\]([^"]*)"/g, (match, p1) => {
    let newClasses = p1
        .replace(/border-\[#1e3a8a\]/g, 'border-white/40')
        .replace(/px-\d+ py-\d+/g, 'px-3 py-2');
    return `className="bg-[#21409A]${newClasses}"`;
});

// 2. Update td borders, padding, and remove bg-white
content = content.replace(/<td className="([^"]*)"/g, (match, p1) => {
    let newClasses = p1
        .replace(/bg-white/g, '')
        .replace(/border-r /g, 'border ')
        .replace(/border-gray-200/g, 'border-[#c0c0c0]')
        .replace(/border-gray-300/g, 'border-[#c0c0c0]')
        .replace(/px-\d+ py-\d+/g, 'px-3 py-2')
        .replace(/\s+/g, ' ').trim();
    
    // Ensure it has 'border' and 'border-[#c0c0c0]' if it had border-r
    if (!newClasses.includes('border-[#c0c0c0]')) {
        newClasses += ' border border-[#c0c0c0]';
    }
    return `<td className="${newClasses}"`;
});

// 3. Update tr hover and striping
// For Step 1
content = content.replace(/<tr key=\{student.id\} className="border-b border-black hover:bg-gray-50 transition-colors">/g, 
    '<tr key={student.id} className="border-b border-[#c0c0c0] hover:bg-blue-50 transition-colors even:bg-white odd:bg-[#f9fafb]">');

// For Step 3 (isSummary)
content = content.replace(/<tr key=\{student.id\} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">/g, 
    '<tr key={student.id} className="border-b border-[#c0c0c0] hover:bg-blue-50 transition-colors even:bg-white odd:bg-[#f9fafb]">');

// For Step 2
content = content.replace(/<tr key=\{item.id\} className=\{`\$\{borderClass\} hover:bg-gray-50 transition-colors`\}>/g, 
    '<tr key={item.id} className={`${borderClass} hover:bg-blue-50 transition-colors ${studentIndex % 2 === 0 ? \'bg-white\' : \'bg-[#f9fafb]\'}`}>');

fs.writeFileSync(filePath, content);
console.log('Done');
