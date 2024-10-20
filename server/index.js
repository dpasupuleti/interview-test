const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const membersJson = require('./members.json');

let members = [...membersJson];

const app = express();

const corsOptions = { origin: '*', optionsSuccessStatus: 200 };
app.use(cors(corsOptions));

app.use(bodyParser.json());

/**
 * @query query: string
 * @query rating: integer
 * @query activities: string
 * @query sortBy: string ('name' or 'activities')
 * @query order: string ('asc' or 'desc')
 */
app.get('/members', (req, res) => {
  const { name, rating, activities, sortBy, order } = req.query;

  let filteredMembers = [...members];

  // Filter by name (search query)
  if (name) {
    const q = name.toLowerCase();
    filteredMembers = filteredMembers.filter(member =>
      member?.name?.toLowerCase()?.includes(q)
    );
  }

  // Filter by rating
  if (rating) {
    filteredMembers = filteredMembers.filter(member => member.rating === parseInt(rating));
  }

  // Filter by activities
  if (activities) {
    filteredMembers = filteredMembers.filter(member =>
      member?.activities?.includes(activities)
    );
  }

  // Sort by name or activities
  if (sortBy) {
    filteredMembers.sort((a, b) => {
      const fieldA = sortBy === 'name' ? a.name.toLowerCase() : a.activities.join(', ').toLowerCase();
      const fieldB = sortBy === 'name' ? b.name.toLowerCase() : b.activities.join(', ').toLowerCase();
      if (order === 'desc') {
        return fieldA < fieldB ? 1 : -1;
      } else {
        return fieldA > fieldB ? 1 : -1;
      }
    });
  }

  console.log('GET /members with filters');
  res.send(filteredMembers);
});

/**
 * @body name: string required
 * @body age: integer
 * @body activities: array[string]
 * @body rating: enum [1-5]
 */
app.post("/members", (req, res) => {
  const body = req.body;
  let newMember = body;
  if (body) {
    if (!body.name) {
      res.status(400).send("Name is required");
      return;
    }
    newMember = {
      id: Math.floor(10000 + Math.random() * 90000),
      activities: [],
      ...body,
    };
    members.push(newMember);
  }
  res.send(newMember);
});

/**
 * @param id: string required
 * 
 * @body name: string required
 * @body age: integer
 * @body activities: array[string]
 * @body rating: enum [1-5]
 */
app.patch('/members/:id', (req, res) => {
  console.log('PATCH /members');
  const id = String(req.params.id);
  const body = req.body;

  let memberFound = false;
  members = members.map(member => {
    if (member.id === id) {
      memberFound = true;
      return { ...member, ...body };
    }
    return member;
  });

  if (memberFound) {
    res.send(body);
  } else {
    res.status(404).send('Member not found');
  }
});

/**
 * @param id: string required
 */
app.delete('/members/:id', (req, res) => {
  console.log('DELETE /members');
  const id = String(req.params.id);

  const memberIndex = members.findIndex(member => member.id === id);

  if (memberIndex !== -1) {
    members.splice(memberIndex, 1);
    res.send('Member removed successfully');
  } else {
    res.status(404).send('Member not found');
  }
});

const PORT = 4444;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
