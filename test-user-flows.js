// User flow testing for Rollout Ready
const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'http://localhost:3000';

async function getPageContent(url) {
  try {
    const response = await axios.get(`${BASE_URL}${url}`);
    return { success: true, html: response.data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: error.response?.status };
  }
}

async function testUserFlow() {
  console.log('🔍 DETAILED USER FLOW TESTING');
  console.log('==============================\n');
  
  // Test 1: Admin Dashboard Content
  console.log('1️⃣ Testing Admin Dashboard Content');
  const adminPage = await getPageContent('/admin');
  if (adminPage.success) {
    const $ = cheerio.load(adminPage.html);
    
    // Check for key elements
    const hasTitle = $('h1').text().includes('Admin Dashboard');
    const hasStatsCards = $('.text-2xl').length >= 4; // Should have 4 stat cards
    const hasManageRolesButton = $('a[href="/admin/roles"]').length > 0;
    const hasManageTemplatesButton = $('a[href="/admin/templates"]').length > 0;
    const hasCreateProjectButton = $('a[href="/admin/projects/new"]').length > 0;
    
    console.log(`   📊 Title present: ${hasTitle ? '✅' : '❌'}`);
    console.log(`   📊 Stats cards: ${hasStatsCards ? '✅' : '❌'} (found ${$('.text-2xl').length})`);
    console.log(`   🔗 Manage Roles link: ${hasManageRolesButton ? '✅' : '❌'}`);
    console.log(`   🔗 Manage Templates link: ${hasManageTemplatesButton ? '✅' : '❌'}`);
    console.log(`   🔗 Create Project link: ${hasCreateProjectButton ? '✅' : '❌'}`);
  } else {
    console.log(`   ❌ Failed to load admin page: ${adminPage.error}`);
  }
  
  // Test 2: Roles Page Content
  console.log('\n2️⃣ Testing Roles Page Content');
  const rolesPage = await getPageContent('/admin/roles');
  if (rolesPage.success) {
    const $ = cheerio.load(rolesPage.html);
    
    const hasTitle = $('h1').text().includes('Manage Roles');
    const hasCreateButton = $('a[href="/admin/roles/new"]').length > 0;
    const hasRolesList = $('table').length > 0 || $('.text-center').text().includes('No roles');
    
    console.log(`   📊 Title present: ${hasTitle ? '✅' : '❌'}`);
    console.log(`   🔗 Create Role button: ${hasCreateButton ? '✅' : '❌'}`);
    console.log(`   📋 Roles list/table: ${hasRolesList ? '✅' : '❌'}`);
  } else {
    console.log(`   ❌ Failed to load roles page: ${rolesPage.error}`);
  }
  
  // Test 3: Templates Page Content
  console.log('\n3️⃣ Testing Templates Page Content');
  const templatesPage = await getPageContent('/admin/templates');
  if (templatesPage.success) {
    const $ = cheerio.load(templatesPage.html);
    
    const hasTitle = $('h1').text().includes('Manage Templates');
    const hasCreateButton = $('a[href="/admin/templates/new"]').length > 0;
    const hasTemplatesList = $('table').length > 0 || $('.text-center').text().includes('No templates');
    
    console.log(`   📊 Title present: ${hasTitle ? '✅' : '❌'}`);
    console.log(`   🔗 Create Template button: ${hasCreateButton ? '✅' : '❌'}`);
    console.log(`   📋 Templates list/table: ${hasTemplatesList ? '✅' : '❌'}`);
  } else {
    console.log(`   ❌ Failed to load templates page: ${templatesPage.error}`);
  }
  
  // Test 4: Project Detail Page
  console.log('\n4️⃣ Testing Project Detail Page');
  const projectPage = await getPageContent('/admin/projects/1');
  if (projectPage.success) {
    const $ = cheerio.load(projectPage.html);
    
    const hasProjectName = $('h1').length > 0;
    const hasStatsCards = $('.text-2xl').length >= 5; // Should have 5 task stat cards
    const hasTeamSection = $('h2, h3').text().includes('Team') || $('h2, h3').text().includes('Assignments');
    const hasTasksSection = $('h2, h3').text().includes('Tasks') || $('table').length > 0;
    
    console.log(`   📊 Project name: ${hasProjectName ? '✅' : '❌'}`);
    console.log(`   📊 Task stats: ${hasStatsCards ? '✅' : '❌'} (found ${$('.text-2xl').length})`);
    console.log(`   👥 Team section: ${hasTeamSection ? '✅' : '❌'}`);
    console.log(`   📋 Tasks section: ${hasTasksSection ? '✅' : '❌'}`);
  } else {
    console.log(`   ❌ Failed to load project page: ${projectPage.error}`);
  }
  
  // Test 5: User Dashboard
  console.log('\n5️⃣ Testing User Dashboard (Ollie)');
  const userPage = await getPageContent('/dashboard/ollie');
  if (userPage.success) {
    const $ = cheerio.load(userPage.html);
    
    const hasUserName = $('h1').text().toLowerCase().includes('ollie');
    const hasStatsCards = $('.text-2xl').length >= 5; // Should have 5 task stat cards
    const hasTasksTable = $('table').length > 0 || $('.text-center').text().includes('No tasks');
    const hasUpdateButtons = $('button').text().includes('Update') || $('button').text().includes('Select');
    
    console.log(`   👤 User name in title: ${hasUserName ? '✅' : '❌'}`);
    console.log(`   📊 Task stats: ${hasStatsCards ? '✅' : '❌'} (found ${$('.text-2xl').length})`);
    console.log(`   📋 Tasks table: ${hasTasksTable ? '✅' : '❌'}`);
    console.log(`   🔄 Update buttons: ${hasUpdateButtons ? '✅' : '❌'}`);
  } else {
    console.log(`   ❌ Failed to load user dashboard: ${userPage.error}`);
  }
  
  // Test 6: Template Detail Page
  console.log('\n6️⃣ Testing Template Detail Page');
  const templatePage = await getPageContent('/admin/templates/1');
  if (templatePage.success) {
    const $ = cheerio.load(templatePage.html);
    
    const hasTemplateName = $('h1').length > 0;
    const hasRoleInfo = $('.text-base, .text-lg').text().includes('Role') || $('span').text().includes('Role');
    const hasTasksList = $('table').length > 0 || $('.text-center').text().includes('No tasks');
    const hasTimeline = $('h2, h3').text().includes('Timeline') || $('.space-y-4').length > 0;
    
    console.log(`   📊 Template name: ${hasTemplateName ? '✅' : '❌'}`);
    console.log(`   👥 Role information: ${hasRoleInfo ? '✅' : '❌'}`);
    console.log(`   📋 Tasks list: ${hasTasksList ? '✅' : '❌'}`);
    console.log(`   📅 Timeline view: ${hasTimeline ? '✅' : '❌'}`);
  } else {
    console.log(`   ❌ Failed to load template page: ${templatePage.error}`);
  }
  
  // Test 7: API Data Validation
  console.log('\n7️⃣ Testing API Data Validation');
  try {
    const rolesResponse = await axios.get(`${BASE_URL}/api/roles`);
    const templatesResponse = await axios.get(`${BASE_URL}/api/templates`);
    
    const rolesData = rolesResponse.data;
    const templatesData = templatesResponse.data;
    
    console.log(`   📊 Roles API returns array: ${Array.isArray(rolesData) ? '✅' : '❌'}`);
    console.log(`   📊 Roles count: ${rolesData.length} roles`);
    console.log(`   📊 Templates API returns array: ${Array.isArray(templatesData) ? '✅' : '❌'}`);
    console.log(`   📊 Templates count: ${templatesData.length} templates`);
    
    if (rolesData.length > 0) {
      const firstRole = rolesData[0];
      const hasRequiredFields = firstRole.id && firstRole.name;
      console.log(`   📊 Role has required fields: ${hasRequiredFields ? '✅' : '❌'}`);
    }
    
    if (templatesData.length > 0) {
      const firstTemplate = templatesData[0];
      const hasRequiredFields = firstTemplate.id && firstTemplate.name && firstTemplate.role;
      console.log(`   📊 Template has required fields: ${hasRequiredFields ? '✅' : '❌'}`);
    }
  } catch (error) {
    console.log(`   ❌ API validation failed: ${error.message}`);
  }
  
  console.log('\n🎯 SUMMARY');
  console.log('==========');
  console.log('This test validates that:');
  console.log('✅ All pages load successfully');
  console.log('✅ Key UI elements are present');
  console.log('✅ Navigation links exist');
  console.log('✅ Data is properly structured');
  console.log('\nFor full functionality testing, manual browser testing is recommended.');
}

// Run if called directly
if (require.main === module) {
  testUserFlow().catch(console.error);
}

module.exports = { testUserFlow };
