import api from './api';

function unwrapSkillListResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.skills)) {
    return data.skills;
  }

  return [];
}

function unwrapSkillResponse(data) {
  return data?.skill || data;
}

function toPayload(skillData = {}) {
  return {
    ...skillData,
    imageFileName: skillData.imageFileName || '',
  };
}

export function getAllSkills(params = {}) {
  return api.get('/skills', { params }).then((response) => unwrapSkillListResponse(response.data));
}

export function searchSkills(params = {}) {
  return api.get('/skills/search', { params }).then((response) => unwrapSkillListResponse(response.data));
}

export function getSkillById(id) {
  return api.get(`/skills/${id}`).then((response) => unwrapSkillResponse(response.data));
}

export function createSkill(skillData) {
  return api.post('/skills', toPayload(skillData)).then((response) => unwrapSkillResponse(response.data));
}

export function updateSkill(id, skillData) {
  return api.put(`/skills/${id}`, toPayload(skillData)).then((response) => unwrapSkillResponse(response.data));
}

export function deleteSkill(id) {
  return api.delete(`/skills/${id}`).then((response) => response.data);
}
