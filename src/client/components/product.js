const fruits = data => data.isFruit && `<ul>${data.fruit
  .map(v => `<li>${v.name} are ${v.colour}</li>`).join('')}</ul>`;
const cars = data => data.isCars && `<ul>${data.cars
  .map(v => `<li>${v.name}s are ${v.speed}</li>`).join('')}</ul>`;

export default data => `
  <p>Some fruit if isFruit is true:<p>
  ${fruits(data)}
  <p>Some cars if isCars is true:</p>
  ${cars(data)}
`;
