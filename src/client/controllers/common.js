const updateActive = (id) => {
  const activeLinks = document.querySelector('.topnav .active');
  if (activeLinks) activeLinks.classList.remove('active');

  const activeLink = document.querySelector(`#${id}`);
  if (activeLink) activeLink.classList.add('active');
};

export { updateActive };
