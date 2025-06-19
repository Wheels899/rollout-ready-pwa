// Test project viewing functionality specifically
const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'http://localhost:3000';

async function testProjectViewing() {
  console.log('🔍 TESTING PROJECT VIEWING FUNCTIONALITY');
  console.log('=========================================\n');
  
  try {
    // Test 1: Check admin dashboard for project links
    console.log('1️⃣ Testing Admin Dashboard for Project Links');
    const adminResponse = await axios.get(`${BASE_URL}/admin`);
    const $ = cheerio.load(adminResponse.data);
    
    // Look for project links
    const projectLinks = $('a[href*="/admin/projects/"]').not('[href="/admin/projects/new"]');
    console.log(`   Found ${projectLinks.length} project view links`);
    
    projectLinks.each((i, link) => {
      const href = $(link).attr('href');
      const text = $(link).text().trim();
      console.log(`   - Link ${i + 1}: ${href} (${text})`);
    });
    
    if (projectLinks.length === 0) {
      console.log('   ❌ No project view links found on admin dashboard');
      console.log('   🔍 Looking for project names in the page...');
      
      // Look for project names in the content
      const pageText = $.text();
      if (pageText.includes('Deploy MES')) {
        console.log('   ✅ Found "Deploy MES" project name in content');
      } else {
        console.log('   ❌ No "Deploy MES" project found in content');
      }
    }
    
    // Test 2: Direct project URL access
    console.log('\n2️⃣ Testing Direct Project URL Access');
    const projectIds = [1, 2, 3, 4];
    
    for (const id of projectIds) {
      try {
        const projectResponse = await axios.get(`${BASE_URL}/admin/projects/${id}`);
        const project$ = cheerio.load(projectResponse.data);
        
        const title = project$('h1').first().text().trim();
        const hasStats = project$('.text-2xl').length;
        const hasTable = project$('table').length > 0;
        
        console.log(`   Project ${id}: ✅ Status ${projectResponse.status}`);
        console.log(`     Title: "${title}"`);
        console.log(`     Stats cards: ${hasStats}`);
        console.log(`     Has task table: ${hasTable}`);
        
        // Check for specific content
        if (title.includes('Deploy MES') || title.includes('ChowChow')) {
          console.log(`     ✅ Valid project title found`);
        } else {
          console.log(`     ⚠️  Unexpected title format`);
        }
        
      } catch (error) {
        console.log(`   Project ${id}: ❌ Error ${error.response?.status || error.message}`);
      }
    }
    
    // Test 3: Check for edit functionality
    console.log('\n3️⃣ Testing Project Edit Links');
    for (const id of [1, 2]) {
      try {
        const projectResponse = await axios.get(`${BASE_URL}/admin/projects/${id}`);
        const project$ = cheerio.load(projectResponse.data);
        
        const editLink = project$(`a[href="/admin/projects/${id}/edit"]`);
        const backLink = project$('a[href="/admin"]');
        
        console.log(`   Project ${id}:`);
        console.log(`     Edit link present: ${editLink.length > 0 ? '✅' : '❌'}`);
        console.log(`     Back to Admin link: ${backLink.length > 0 ? '✅' : '❌'}`);
        
      } catch (error) {
        console.log(`   Project ${id}: ❌ Error accessing page`);
      }
    }
    
    // Test 4: Check if edit pages exist
    console.log('\n4️⃣ Testing Project Edit Pages');
    for (const id of [1, 2]) {
      try {
        const editResponse = await axios.get(`${BASE_URL}/admin/projects/${id}/edit`);
        console.log(`   Project ${id} edit page: ✅ Status ${editResponse.status}`);
      } catch (error) {
        console.log(`   Project ${id} edit page: ❌ Status ${error.response?.status || 'ERROR'}`);
        if (error.response?.status === 404) {
          console.log(`     🔧 Edit page not implemented yet`);
        }
      }
    }
    
    // Test 5: Verify database has projects
    console.log('\n5️⃣ Testing Database Project Data');
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const projects = await prisma.project.findMany({
        include: {
          projectRoles: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              projectTasks: true,
            },
          },
        },
      });
      
      console.log(`   Database has ${projects.length} projects:`);
      projects.forEach(project => {
        console.log(`   - ID ${project.id}: "${project.name}" (${project._count.projectTasks} tasks)`);
        console.log(`     Team: ${project.projectRoles.map(pr => `${pr.role.name}: ${pr.userName}`).join(', ')}`);
      });
      
      await prisma.$disconnect();
      
    } catch (error) {
      console.log(`   ❌ Database check failed: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

// Run the test
testProjectViewing().catch(console.error);
