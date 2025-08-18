const fs = require('fs').promises;
const path = require('path');

// These paths are relative to the project root
const DATA_ROOT = path.join(__dirname, '..', 'data');
const API_PATHS = {
    articleDir: path.join(DATA_ROOT, 'articles'),
    staff: path.join(DATA_ROOT, 'staff.txt'),
};

const ANDOVERVIEW_STAFF_MEMBER = {
    id: 0,
    name: "ANDOVERVIEW",
    role: "Editorial Board",
    image: "assets/icons/andoverview-avatar.svg",
    bio: "This editorial represents the collective voice and viewpoint of the ANDOVERVIEW student newspaper staff.",
    authorLink: "#articles-page-editorial"
};

const ROLE_ORDER = [
    "Editor-in-Chief", "Managing Editor", "Sports Editor", "Opinion Editor", "Arts Editor",
    "Editorial Board", "Photographer", "Staff Writer", "Contributor"
];

const VALID_PLACEMENTS = new Set([
    'Top Left', 'Top Center', 'Top Right',
    'Middle Left', 'Middle Center', 'Middle Right',
    'Bottom Center', 'Bottom Left', 'Bottom Right'
]);

function isValueNA(value) {
    return !value || value.trim().toLowerCase() === 'n/a';
}

function splitMultiValueString(str) {
    if (isValueNA(str)) return [];
    const normalizedStr = str.replace(/\s+and\s+/gi, ',').replace(/\s*&\s*/g, ',');
    return normalizedStr.split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}

function parseArticleTxt(txt, filename) {
    const article = { id: filename.split('.')[0], images: [] };
    const separatorMatch = txt.match(/^\s*---\s*$|\n\s*\n/m);
    const contentIndex = separatorMatch ? separatorMatch.index + separatorMatch[0].length : -1;
    let frontmatterText, markdownContent;
    if (contentIndex === -1) {
        if (txt.includes(':')) {
            frontmatterText = txt;
            markdownContent = '';
        } else {
            frontmatterText = '';
            markdownContent = txt;
        }
    } else {
        frontmatterText = txt.substring(0, contentIndex);
        markdownContent = txt.substring(contentIndex);
    }
    const frontmatter = {};
    if (frontmatterText) {
        frontmatterText.split('\n').forEach(line => {
            const separatorIndex = line.indexOf(':');
            if (separatorIndex > 0) {
                const key = line.substring(0, separatorIndex).trim().toLowerCase();
                const value = line.substring(separatorIndex + 1).trim();
                frontmatter[key] = value;
            }
        });
    }
    article.title = isValueNA(frontmatter.title) ? 'Untitled Article' : frontmatter.title;
    const rawDescription = isValueNA(frontmatter.description) ? '' : frontmatter.description;
    article.rawDescription = rawDescription;
    article.description = rawDescription;
    article.date = isValueNA(frontmatter.date) ? '' : frontmatter.date;
    article.display = isValueNA(frontmatter.display) ? 'recent' : frontmatter.display;
    article.author = splitMultiValueString(frontmatter.author);
    article.tags = splitMultiValueString(frontmatter.tags);
    article.positions = splitMultiValueString(frontmatter.position);
    const categories = splitMultiValueString(frontmatter.category);
    const specificCategories = categories.filter(c => c.toLowerCase() !== 'articles');
    article.category = specificCategories[0] || categories[0] || 'Uncategorized';
    article.categories = categories;
    for (let i = 1; i < 10; i++) {
        const fileKey = `imagefile ${i}`;
        if (!isValueNA(frontmatter[fileKey])) {
            const placementKey = `imageplacement ${i}`;
            const captionKey = `imagecaption ${i}`;
            const creditKey = `imagecredit ${i}`;
            let placement = frontmatter[placementKey] || 'Top Center';
            if (!VALID_PLACEMENTS.has(placement)) {
                placement = 'Top Center';
            }
            article.images.push({
                file: frontmatter[fileKey],
                placement: placement,
                caption: isValueNA(frontmatter[captionKey]) ? '' : frontmatter[captionKey],
                credit: isValueNA(frontmatter[creditKey]) ? '' : frontmatter[creditKey]
            });
        }
    }
    if (article.images.length === 0 && !isValueNA(frontmatter.image)) {
        article.images.push({
            file: frontmatter.image,
            placement: 'Top Center',
            caption: isValueNA(frontmatter.imagecaption) ? '' : frontmatter.imagecaption,
            credit: isValueNA(frontmatter.imagecredit) ? '' : frontmatter.imagecredit
        });
    }
    if (article.images.length > 0) {
        article.image = article.images[0].file;
    }
    article.content = markdownContent;
    return article;
}

function parseStaffTxt(txt) {
    if (!txt) return [];
    const blocks = txt.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean);
    return blocks.map(block => {
        const staffMember = {};
        const lines = block.split('\n');
        lines.forEach(line => {
            const separatorIndex = line.indexOf(':');
            if (separatorIndex === -1) return;
            const key = line.substring(0, separatorIndex).trim().toLowerCase();
            const value = line.substring(separatorIndex + 1).trim();
            if (key && value) {
                staffMember[key] = value;
            }
        });
        return staffMember;
    });
}

async function getArticles() {
    try {
        const articleFiles = await fs.readdir(API_PATHS.articleDir);
        const articlePromises = articleFiles
            .filter(filename => filename.endsWith('.txt'))
            .map(async (filename) => {
            try {
                const articleTxt = await fs.readFile(path.join(API_PATHS.articleDir, filename), 'utf-8');
                return parseArticleTxt(articleTxt, filename);
            } catch (e) {
                console.error(`Failed to load or parse ${filename}`, e);
                return null;
            }
        });
        const articles = (await Promise.all(articlePromises)).filter(Boolean);
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        return articles;
    } catch (error) {
        console.error("Could not read article directory:", error);
        return [];
    }
}

async function getStaff() {
    try {
        const staffTxt = await fs.readFile(API_PATHS.staff, 'utf-8');
        const staffData = parseStaffTxt(staffTxt);
        return staffData.map(person => ({
            ...person,
            image: person.image || 'assets/icons/placeholder-staff.svg'
        }));
    } catch (error) {
        console.error("Could not fetch or parse staff data:", error);
        return [];
    }
}

async function getCombinedDataFromFileSystem() {
    const [articles, staff] = await Promise.all([getArticles(), getStaff()]);
    const staffMap = new Map(staff.map(s => [s.name.toLowerCase(), s]));
    const articlesWithWriters = articles.map(article => {
        const isEditorial = article.categories && article.categories.some(c => c.toLowerCase() === 'editorial');
        if (isEditorial) {
            return { ...article, writers: [{...ANDOVERVIEW_STAFF_MEMBER, isCurrentStaff: true}] };
        }
        const authorNames = article.author || [];
        const writers = authorNames.map((authorName, index) => {
            let writer;
            const writerData = staffMap.get(authorName.toLowerCase());
            if (writerData) {
                writer = { ...writerData, isCurrentStaff: true };
            } else {
                const formerWriter = { name: authorName, isCurrentStaff: false };
                const positions = article.positions || [];
                let position;
                if (positions.length === 1 && authorNames.length > 1) {
                    position = positions[0];
                } else {
                    position = positions[index];
                }
                if (position && !isValueNA(position)) {
                    formerWriter.role = position;
                }
                writer = formerWriter;
            }
            if (!writer.image) {
                writer.image = 'assets/icons/placeholder-avatar.svg';
            }
            return writer;
        });
        writers.sort((a, b) => {
            if (a.isCurrentStaff && !b.isCurrentStaff) return -1;
            if (!a.isCurrentStaff && b.isCurrentStaff) return 1;
            if (a.isCurrentStaff && b.isCurrentStaff) {
                const roleIndexA = ROLE_ORDER.indexOf(a.role);
                const roleIndexB = ROLE_ORDER.indexOf(b.role);
                if (roleIndexA !== roleIndexB) {
                    return (roleIndexA === -1 ? 999 : roleIndexA) - (roleIndexB === -1 ? 999 : roleIndexB);
                }
            }
            return a.name.localeCompare(b.name);
        });
        return { ...article, writers };
    });
    return { articles: articlesWithWriters, staff };
}

module.exports = { getCombinedDataFromFileSystem };