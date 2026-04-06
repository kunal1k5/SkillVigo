const BASE_URL = process.env.TEST_API_URL || 'http://127.0.0.1:5000/api';

const timestamp = Date.now();
const providerPayload = {
  name: 'SkillVigo Provider Test',
  email: `provider.${timestamp}@example.com`,
  password: 'StrongPass123',
  role: 'provider',
  phone: '9876543210',
  location: 'Kolkata',
};

const seekerPayload = {
  name: 'SkillVigo Seeker Test',
  email: `seeker.${timestamp}@example.com`,
  password: 'StrongPass123',
  role: 'seeker',
  phone: '9876543211',
  location: 'Delhi',
};

const skillPayload = {
  title: 'MERN Stack Coaching',
  description: 'Hands-on coaching for React, Node.js, Express, and MongoDB.',
  category: 'Programming',
  price: 4999,
  experience: 4,
  location: 'Kolkata',
};

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(
      data?.message || data?.error || `Request failed with status ${response.status}`,
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function run() {
  console.log(`Testing API at ${BASE_URL}`);

  const providerRegister = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(providerPayload),
  });
  console.log('Provider register:', providerRegister);

  const providerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: providerPayload.email,
      password: providerPayload.password,
    }),
  });
  console.log('Provider login:', providerLogin);

  const providerToken = providerLogin.token;

  const createdSkill = await request('/skills', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${providerToken}`,
    },
    body: JSON.stringify(skillPayload),
  });
  console.log('Create skill:', createdSkill);

  const skillId = createdSkill.skill.id;

  const allSkills = await request('/skills', {
    method: 'GET',
  });
  console.log('All skills count:', allSkills.count);

  const singleSkill = await request(`/skills/${skillId}`, {
    method: 'GET',
  });
  console.log('Single skill:', singleSkill);

  const updatedSkill = await request(`/skills/${skillId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${providerToken}`,
    },
    body: JSON.stringify({
      price: 5999,
      experience: 5,
    }),
  });
  console.log('Update skill:', updatedSkill);

  const seekerRegister = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(seekerPayload),
  });
  console.log('Seeker register:', seekerRegister);

  const seekerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: seekerPayload.email,
      password: seekerPayload.password,
    }),
  });
  console.log('Seeker login:', seekerLogin);

  try {
    await request('/skills', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${seekerLogin.token}`,
      },
      body: JSON.stringify(skillPayload),
    });
    console.error('Expected seeker create-skill request to fail, but it succeeded.');
    process.exitCode = 1;
    return;
  } catch (error) {
    console.log('Seeker create-skill blocked as expected:', {
      status: error.status,
      data: error.data,
    });
  }

  const deleteSkill = await request(`/skills/${skillId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${providerToken}`,
    },
  });
  console.log('Delete skill:', deleteSkill);

  console.log('API smoke test completed successfully.');
}

run().catch((error) => {
  console.error('API smoke test failed.');
  console.error('Status:', error.status || 'unknown');
  console.error('Response:', error.data || error.message);
  process.exit(1);
});
