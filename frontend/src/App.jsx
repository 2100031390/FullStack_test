import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)

  const API_BASE = 'http://localhost:8080/api'

  useEffect(() => {
    fetchUsers()
    fetchGroups()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setUsers([])
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE}/groups`)
      if (!res.ok) throw new Error('Failed to fetch groups')
      const data = await res.json()
      setGroups(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setGroups([])
    }
  }

  const createUser = async (name, email) => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to create user')
      }
      fetchUsers()
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  const createGroup = async (name, createdById, memberIds) => {
    try {
      const res = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, createdById, memberIds })
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to create group')
      }
      fetchGroups()
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  const addExpense = async (description, amount, paidById, groupId, splitType, splits) => {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount, paidById, groupId, splitType, splits })
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to add expense')
      }
      // Refresh balances for the group the expense was added to
      fetchBalances(groupId)
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  const fetchBalances = async (groupId) => {
    try {
      const res = await fetch(`${API_BASE}/balances/group/${groupId}`)
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to fetch balances')
      }
      const data = await res.json()
      setBalances(Array.isArray(data) ? data : [])
      setSelectedGroup(groups.find(g => g.id == groupId))
    } catch (error) {
      console.error(error)
      setBalances([])
      alert(error.message)
    }
  }

  const settle = async (fromUserId, toUserId, amount, groupId) => {
    try {
      const res = await fetch(`${API_BASE}/balances/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, toUserId, amount, groupId })
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to settle')
      }
      fetchBalances(groupId)
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  return (
    <div className="App">
      <h1>Expense Sharing App</h1>

      <section>
        <h2>Create User</h2>
        <UserForm onSubmit={createUser} />
      </section>

      <section>
        <h2>Users</h2>
        <ul>
          {users.map(user => <li key={user.id}>{user.name} ({user.email})</li>)}
        </ul>
      </section>

      <section>
        <h2>Create Group</h2>
        <GroupForm users={users} onSubmit={createGroup} />
      </section>

      <section>
        <h2>Groups</h2>
        <ul>
          {groups.map(group => (
            <li key={group.id}>
              {group.name} - Creator: {group.createdBy?.name}
              <button onClick={() => fetchBalances(group.id)}>View Balances</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Add Expense</h2>
        <ExpenseForm groups={groups} onSubmit={addExpense} onGroupSelect={setSelectedGroup} />
      </section>

      {selectedGroup && (
        <>
          <section>
            <h2>Balances for {selectedGroup.name}</h2>
            {balances.length === 0 ? (
              <p>No balances found for this group.</p>
            ) : (
              <ul>
                {balances.map(balance => (
                  <li key={`${balance.fromUser.id}-${balance.toUser.id}`}>
                    {balance.fromUser.name} owes {balance.toUser.name} ₹{balance.amount}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2>Settle Dues for {selectedGroup.name}</h2>
            <SettlementForm selectedGroup={selectedGroup} balances={balances} onSubmit={settle} />
          </section>
        </>
      )}
    </div>
  )
}

function UserForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(name, email)
    setName('')
    setEmail('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <button type="submit">Create User</button>
    </form>
  )
}

function GroupForm({ users, onSubmit }) {
  const [name, setName] = useState('')
  const [createdById, setCreatedById] = useState('')
  const [memberIds, setMemberIds] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(name, createdById, memberIds)
    setName('')
    setCreatedById('')
    setMemberIds([])
  }

  const handleMemberChange = (userId, checked) => {
    if (checked) {
      setMemberIds([...memberIds, userId])
    } else {
      setMemberIds(memberIds.filter(id => id != userId))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Group Name" required />
      <select value={createdById} onChange={e => setCreatedById(e.target.value)} required>
        <option value="">Select Creator</option>
        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>
      <div className="checkbox-group">
        {users.filter(user => user.id != createdById).map(user => (
          <label key={user.id}>
            <input type="checkbox" onChange={e => handleMemberChange(user.id, e.target.checked)} />
            {user.name}
          </label>
        ))}
      </div>
      <button type="submit">Create Group</button>
    </form>
  )
}

function ExpenseForm({ groups, onSubmit, onGroupSelect }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidById, setPaidById] = useState('')
  const [groupId, setGroupId] = useState('')
  const [splitType, setSplitType] = useState('EQUAL')
  const [splits, setSplits] = useState([])
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([])

  const handleGroupChange = (gid) => {
    setGroupId(gid)
    const group = groups.find(g => g.id == gid)
    setSelectedGroupUsers(group ? group.members : [])
    onGroupSelect(group)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!groupId) {
      alert('Please select a group')
      return
    }
    if (!description.trim()) {
      alert('Please enter a description')
      return
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert('Please enter a valid positive amount')
      return
    }
    if (!paidById) {
      alert('Please select who paid')
      return
    }
    onSubmit(description.trim(), parseFloat(amount), paidById, groupId, splitType, splits)
    setDescription('')
    setAmount('')
    setPaidById('')
    setGroupId('')
    setSplits([])
    setSelectedGroupUsers([])
  }

  const updateSplits = (userId, amount, percentage) => {
    setSplits(prev => {
      const existing = prev.find(s => s.userId == userId)
      if (existing) {
        return prev.map(s => s.userId == userId ? { ...s, amount: amount || 0, percentage: percentage || 0 } : s)
      } else {
        return [...prev, { userId, amount: amount || 0, percentage: percentage || 0 }]
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={groupId} onChange={e => handleGroupChange(e.target.value)} required>
        <option value="">Select Group</option>
        {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
      </select>
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" required />
      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" type="number" required />
      <select value={paidById} onChange={e => setPaidById(e.target.value)} required>
        <option value="">Paid By</option>
        {selectedGroupUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>
      <select value={splitType} onChange={e => setSplitType(e.target.value)}>
        <option value="EQUAL">Equal</option>
        <option value="EXACT">Exact</option>
        <option value="PERCENTAGE">Percentage</option>
      </select>
      {(splitType === 'EXACT' || splitType === 'PERCENTAGE') && (
        <div className="split-inputs">
          {selectedGroupUsers.map(user => (
            <div key={user.id}>
              <label>{user.name}:</label>
              <input
                type="number"
                placeholder={splitType === 'EXACT' ? 'Amount' : 'Percentage'}
                onChange={e => updateSplits(user.id, splitType === 'EXACT' ? parseFloat(e.target.value) : null, splitType === 'PERCENTAGE' ? parseFloat(e.target.value) : null)}
              />
            </div>
          ))}
        </div>
      )}
      <button type="submit">Add Expense</button>
    </form>
  )
}

function SettlementForm({ selectedGroup, balances, onSubmit }) {
  const [fromUserId, setFromUserId] = useState('')
  const [toUserId, setToUserId] = useState('')
  const [amount, setAmount] = useState('')

  // Include creator if not already in members
  const allMembers = Array.from(new Set([...selectedGroup.members, selectedGroup.createdBy]))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(fromUserId, toUserId, parseFloat(amount), selectedGroup.id)
    setFromUserId('')
    setToUserId('')
    setAmount('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={fromUserId} onChange={e => setFromUserId(e.target.value)} required>
        <option value="">From</option>
        {allMembers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>
      <select value={toUserId} onChange={e => setToUserId(e.target.value)} required>
        <option value="">To</option>
        {allMembers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>
      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" type="number" required />
      <button type="submit">Settle</button>
    </form>
  )
}

export default App
