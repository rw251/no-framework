import Template from 'rw-templater';

const updateBreadcrumbs = (crumbs) => {
  const html = Template.it('breadcrumbs', { breadcrumbs: crumbs.slice(0, -1), lastBreadcrumb: crumbs.slice(-1)[0] });
  document.getElementById('breadcrumbs').innerHTML = html;
};

const updateActive = (id) => {
  const activeLinks = document.querySelector('li.active');
  if (activeLinks) activeLinks.classList.remove('active');

  document.querySelector(`#${id}`).classList.add('active');
};

export { updateActive, updateBreadcrumbs };
