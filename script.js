
const state = { data: [], effects: [], idx: 0, effIdx: 0 };

function useState(init) {
    const i = state.idx++;
    if (state.data[i] === undefined) state.data[i] = init;
    const set = (v) => { state.data[i] = typeof v === 'function' ? v(state.data[i]) : v; render(); };
    return [state.data[i], set];
}

function useEffect(cb, deps) {
    const i = state.effIdx++;
    const old = state.effects[i];
    const changed = !old || deps.some((d, j) => d !== old[j]);
    if (changed) { state.effects[i] = deps; setTimeout(cb, 0); }
}

function h(tag, props, ...children) {
    if (typeof tag === 'function') return tag(props);
    const el = document.createElement(tag);
    if (props) {
        for (let key in props) {
            if (key === 'className') el.className = props[key];
            else if (key === 'style') Object.assign(el.style, props[key]);
            else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), props[key]);
            else if (key === 'checked' || key === 'value') el[key] = props[key];
            else el.setAttribute(key, props[key]);
        }
    }
    children.flat(Infinity).forEach(c => {
        if (c != null && c !== false) el.appendChild(typeof c === 'object' ? c : document.createTextNode(c));
    });
    return el;
}

const svg = (d) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2');
    s.style.width = d.w || '20px';
    s.style.height = d.h || '20px';
    s.innerHTML = d.p;
    return s;
};

const icons = {
    trash: () => svg({ w: '18px', h: '18px', p: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' }),
    plus: () => svg({ p: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' }),
    user: () => svg({ w: '16px', h: '16px', p: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' }),
    save: () => svg({ w: '16px', h: '16px', p: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>' }),
    down: () => svg({ p: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' }),
    up: () => svg({ p: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' }),
    edit: () => svg({ w: '18px', h: '18px', p: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' })
};

function App() {
    state.idx = 0; state.effIdx = 0;

    const [profiles, setProfiles] = useState([]);
    const [current, setCurrent] = useState(null);
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSchengen, setIsSchengen] = useState(true);
    const [days, setDays] = useState([]);
    const [editingDay, setEditingDay] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [newDay, setNewDay] = useState({
        date: '', startTime: '', endTime: '', break1Start: '', break1End: '',
        break2Start: '', break2End: '', isHoliday: false, isWeekend: false
    });

    const checkWeekend = (dateStr) => {
        if (!dateStr) return false;
        const date = new Date(dateStr + 'T00:00:00');
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const handleDateChange = (dateStr) => {
        const isWeekendDay = checkWeekend(dateStr);
        setNewDay({ ...newDay, date: dateStr, isWeekend: isWeekendDay });
    };

    useEffect(() => {
        const saved = localStorage.getItem('salaryCalc');
        if (saved) {
            try {
                const d = JSON.parse(saved);
                setProfiles(d.profiles || []);
                if (d.currentId) {
                    const p = d.profiles.find(x => x.id === d.currentId);
                    if (p) { setCurrent(p); setDays(p.workDays || []); setIsSchengen(p.isSchengen); }
                }
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (profiles.length === 0 && !localStorage.getItem('salaryCalc')) setShowNew(true);
    }, [profiles.length]);

    useEffect(() => {
        if (days.length > 0 && !selectedMonth) {
            const latestDate = days[days.length - 1].date;
            if (latestDate) {
                setSelectedMonth(latestDate.substring(0, 7));
            }
        }
    }, [days.length]);

    useEffect(() => {
        if (profiles.length > 0) {
            localStorage.setItem('salaryCalc', JSON.stringify({ profiles, currentId: current?.id }));
        }
    }, [profiles, current]);

    const calcRate = (h) => {
        if (h < 40) return 1675;
        if (h <= 80) return 1795;
        if (h <= 100) return 1835;
        if (h <= 120) return 1885;
        if (h <= 150) return 1925;
        return 1975;
    };

    const toMin = (t) => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; };

    const calcEarn = (d, totalMonthlyHours) => {
        const sMin = toMin(d.startTime), eMin = toMin(d.endTime);
        let tot = eMin - sMin; if (eMin < sMin) tot += 24 * 60;
        let brk = 0;
        if (d.break1Start && d.break1End) brk += toMin(d.break1End) - toMin(d.break1Start);
        if (d.break2Start && d.break2End) brk += toMin(d.break2End) - toMin(d.break2Start);
        const wrk = tot - brk, hrs = wrk / 60, rate = calcRate(totalMonthlyHours);
        if (d.isHoliday) return hrs * rate * 2;
        let earn = 0;
        for (let i = 0; i < wrk; i++) {
            const cMin = (sMin + i) % (24 * 60);
            const isBrk = (d.break1Start && cMin >= toMin(d.break1Start) && cMin < toMin(d.break1End)) ||
                (d.break2Start && cMin >= toMin(d.break2Start) && cMin < toMin(d.break2End));
            if (isBrk) continue;
            const cHr = Math.floor(cMin / 60);
            let r = rate;
            if (cHr >= 22 || cHr < 6) r = rate * 1.4;
            else if (cHr >= 18) r = rate * 1.3;
            if (d.isWeekend) r *= 1.2;
            earn += r / 60;
        }
        return earn;
    };

    const addDay = () => {
        if (!newDay.date || !newDay.startTime || !newDay.endTime) {
            alert('Please fill date, start and end time'); return;
        }
        let upd;
        if (editingDay) {
            upd = days.map(d => d.id === editingDay.id ? { ...newDay, id: editingDay.id } : d);
            setEditingDay(null);
        } else {
            upd = [...days, { ...newDay, id: Date.now() }];
        }
        setDays(upd);
        if (current) setProfiles(profiles.map(p => p.id === current.id ? { ...p, workDays: upd } : p));
        setNewDay({
            date: '', startTime: '', endTime: '', break1Start: '', break1End: '',
            break2Start: '', break2End: '', isHoliday: false, isWeekend: false
        });
    };

    const editDay = (d) => {
        setEditingDay(d);
        setNewDay({
            date: d.date, startTime: d.startTime, endTime: d.endTime,
            break1Start: d.break1Start || '', break1End: d.break1End || '',
            break2Start: d.break2Start || '', break2End: d.break2End || '',
            isHoliday: d.isHoliday, isWeekend: d.isWeekend
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingDay(null);
        setNewDay({
            date: '', startTime: '', endTime: '', break1Start: '', break1End: '',
            break2Start: '', break2End: '', isHoliday: false, isWeekend: false
        });
    };

    const delDay = (id) => {
        const upd = days.filter(d => d.id !== id);
        setDays(upd);
        if (current) setProfiles(profiles.map(p => p.id === current.id ? { ...p, workDays: upd } : p));
    };

    const createProf = () => {
        if (!newName.trim()) { alert('Enter profile name'); return; }
        const np = { id: Date.now(), name: newName, isSchengen, workDays: [] };
        setProfiles([...profiles, np]);
        setCurrent(np); setDays([]); setNewName(''); setShowNew(false);
    };

    const switchProf = (p) => { setCurrent(p); setDays(p.workDays || []); setIsSchengen(p.isSchengen); };

    const updTax = () => {
        if (current) {
            const upd = profiles.map(p => p.id === current.id ? { ...p, isSchengen } : p);
            setProfiles(upd); setCurrent({ ...current, isSchengen });
        }
    };

    const exportD = () => {
        const data = JSON.stringify({ profiles, currentId: current?.id, date: new Date().toISOString() }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `salary-${new Date().toISOString().split('T')[0]}.json`;
        a.click(); URL.revokeObjectURL(url);
    };

    const importD = (e) => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = (ev) => {
            try {
                const d = JSON.parse(ev.target.result);
                setProfiles(d.profiles || []);
                if (d.currentId) {
                    const p = d.profiles.find(x => x.id === d.currentId);
                    if (p) { setCurrent(p); setDays(p.workDays || []); setIsSchengen(p.isSchengen); }
                }
                alert('Imported successfully!');
            } catch (err) { alert('Import error'); }
        };
        r.readAsText(f); e.target.value = '';
    };

    const filteredDays = selectedMonth
        ? days.filter(d => d.date.startsWith(selectedMonth))
        : days;

    let totalHours = 0;
    filteredDays.forEach(d => {
        const sMin = toMin(d.startTime), eMin = toMin(d.endTime);
        let tot = eMin - sMin; if (eMin < sMin) tot += 24 * 60;
        let brk = 0;
        if (d.break1Start && d.break1End) brk += toMin(d.break1End) - toMin(d.break1Start);
        if (d.break2Start && d.break2End) brk += toMin(d.break2End) - toMin(d.break2Start);
        totalHours += (tot - brk) / 60;
    });

    const currentBaseRate = calcRate(totalHours);

    const daysCalc = filteredDays.map(d => {
        const sMin = toMin(d.startTime), eMin = toMin(d.endTime);
        let tot = eMin - sMin; if (eMin < sMin) tot += 24 * 60;
        let brk = 0;
        if (d.break1Start && d.break1End) brk += toMin(d.break1End) - toMin(d.break1Start);
        if (d.break2Start && d.break2End) brk += toMin(d.break2End) - toMin(d.break2Start);
        const hrs = (tot - brk) / 60;

        const earn = calcEarn(d, totalHours);

        return { ...d, earnings: earn, workedHours: hrs, baseRateUsed: currentBaseRate };
    });

    const availableMonths = [...new Set(days.map(d => d.date.substring(0, 7)))].sort().reverse();

    const totGross = daysCalc.reduce((s, d) => s + d.earnings, 0);
    const totNet = isSchengen ? totGross : totGross * 0.85;
    const totHrs = totalHours;

    if (showNew || profiles.length === 0) {
        return h('div', { className: 'min-h-screen bg-gradient' },
            h('div', { className: 'container' },
                h('div', { className: 'max-w-md mx-auto card' },
                    h('h2', { className: 'text-2xl font-bold mb-6 text-gray-800' }, 'Create Profile'),
                    h('div', { className: 'space-y' },
                        h('div', {},
                            h('label', {}, 'Profile Name'),
                            h('input', {
                                id: 'profileNameInput', type: 'text', value: newName, placeholder: 'Enter your name',
                                onInput: (e) => setNewName(e.target.value)
                            })
                        ),
                        h('div', {},
                            h('label', { className: 'label-inline' },
                                h('input', {
                                    type: 'checkbox', checked: isSchengen,
                                    onChange: (e) => setIsSchengen(e.target.checked)
                                }),
                                h('span', { className: 'text-sm' }, 'Schengen Citizen (No Tax)')
                            ),
                            !isSchengen && h('p', { className: 'text-xs text-gray-600 mt-1 ml-6' }, '15% tax deducted')
                        ),
                        h('button', { className: 'btn btn-primary w-full', onClick: createProf }, 'Create Profile'),
                        profiles.length > 0 && h('button', { className: 'btn btn-gray w-full', onClick: () => setShowNew(false) }, 'Cancel')
                    )
                )
            )
        );
    }

    return h('div', { className: 'min-h-screen bg-gradient' },
        h('div', { className: 'container' },
            h('div', { className: 'card' },
                h('div', { className: 'flex justify-between items-center flex-wrap gap-2 mb-6' },
                    h('h1', { className: 'text-3xl font-bold text-gray-800' }, 'Salary Calculator'),
                    h('div', { className: 'flex gap-2 flex-wrap' },
                        h('button', { className: 'btn btn-purple', onClick: exportD }, icons.down(), 'Export'),
                        h('label', { className: 'btn btn-orange', style: { cursor: 'pointer' } },
                            icons.up(), 'Import',
                            h('input', { type: 'file', accept: '.json', className: 'hidden', onChange: importD })
                        ),
                        h('button', { className: 'btn btn-success', onClick: () => setShowNew(true) }, icons.plus(), 'New')
                    )
                ),
                h('div', { className: 'mb-6' },
                    h('label', {}, 'Active Profile'),
                    h('div', { className: 'flex gap-2 flex-wrap' },
                        profiles.map(p => h('button', {
                            className: `btn btn-profile ${current?.id === p.id ? 'active' : ''}`,
                            onClick: () => switchProf(p)
                        }, icons.user(), p.name))
                    )
                ),
                h('div', { className: 'p-4 bg-gray-50 rounded-lg' },
                    h('div', { className: 'flex justify-between items-center flex-wrap gap-2' },
                        h('label', { className: 'label-inline' },
                            h('input', {
                                type: 'checkbox', checked: isSchengen,
                                onChange: (e) => setIsSchengen(e.target.checked)
                            }),
                            h('span', { className: 'text-sm' }, 'Schengen Citizen')
                        ),
                        h('button', { className: 'btn btn-primary', onClick: updTax }, icons.save(), 'Save Tax')
                    )
                )
            ),
            h('div', { className: 'card' },
                h('h2', { className: 'text-xl font-bold mb-4 text-gray-800' }, editingDay ? 'Edit Work Day' : 'Add Work Day'),
                h('div', { className: 'grid grid-1 md-grid-2 lg-grid-4 mb-4' },
                    h('div', {}, h('label', {}, 'Date'),
                        h('input', {
                            type: 'date', value: newDay.date,
                            onChange: (e) => handleDateChange(e.target.value)
                        })),
                    h('div', {}, h('label', {}, 'Start'),
                        h('input', {
                            type: 'time', value: newDay.startTime,
                            onChange: (e) => setNewDay({ ...newDay, startTime: e.target.value })
                        })),
                    h('div', {}, h('label', {}, 'End'),
                        h('input', {
                            type: 'time', value: newDay.endTime,
                            onChange: (e) => setNewDay({ ...newDay, endTime: e.target.value })
                        })),
                    h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' } },
                        h('label', { className: 'label-inline' },
                            h('input', {
                                type: 'checkbox', checked: newDay.isHoliday,
                                onChange: (e) => setNewDay({ ...newDay, isHoliday: e.target.checked })
                            }),
                            h('span', { className: 'text-sm' }, 'Holiday')
                        ),
                        h('label', { className: 'label-inline' },
                            h('input', {
                                type: 'checkbox', checked: newDay.isWeekend,
                                onChange: (e) => setNewDay({ ...newDay, isWeekend: e.target.checked })
                            }),
                            h('span', { className: 'text-sm' }, 'Weekend')
                        )
                    )
                ),
                h('div', { className: 'grid grid-1 md-grid-2 mb-4' },
                    h('div', { className: 'border rounded-lg p-4' },
                        h('h3', { className: 'text-sm font-medium mb-2' }, 'Break 1 (20 min)'),
                        h('div', { className: 'grid grid-2' },
                            h('div', {}, h('label', { className: 'text-xs' }, 'Start'),
                                h('input', {
                                    type: 'time', value: newDay.break1Start,
                                    onChange: (e) => setNewDay({ ...newDay, break1Start: e.target.value })
                                })),
                            h('div', {}, h('label', { className: 'text-xs' }, 'End'),
                                h('input', {
                                    type: 'time', value: newDay.break1End,
                                    onChange: (e) => setNewDay({ ...newDay, break1End: e.target.value })
                                }))
                        )
                    ),
                    h('div', { className: 'border rounded-lg p-4' },
                        h('h3', { className: 'text-sm font-medium mb-2' }, 'Break 2 (25 min)'),
                        h('div', { className: 'grid grid-2' },
                            h('div', {}, h('label', { className: 'text-xs' }, 'Start'),
                                h('input', {
                                    type: 'time', value: newDay.break2Start,
                                    onChange: (e) => setNewDay({ ...newDay, break2Start: e.target.value })
                                })),
                            h('div', {}, h('label', { className: 'text-xs' }, 'End'),
                                h('input', {
                                    type: 'time', value: newDay.break2End,
                                    onChange: (e) => setNewDay({ ...newDay, break2End: e.target.value })
                                }))
                        )
                    )
                ),
                h('button', { className: 'btn btn-primary w-full py-3', onClick: addDay }, editingDay ? 'Update Work Day' : 'Add Work Day'),
                editingDay && h('button', { className: 'btn btn-gray w-full py-3', style: { marginTop: '0.5rem' }, onClick: cancelEdit }, 'Cancel Edit')
            ),
            h('div', { className: 'card' },
                h('div', { className: 'flex justify-between items-center mb-4 flex-wrap gap-2' },
                    h('h2', { className: 'text-xl font-bold text-gray-800' }, 'Work Days'),
                    h('div', { className: 'flex items-center gap-2 flex-wrap' },
                        h('div', {},
                            h('label', { className: 'text-sm font-medium text-gray-700 mb-1' }, 'Filter by Month'),
                            h('select', {
                                value: selectedMonth,
                                onChange: (e) => setSelectedMonth(e.target.value),
                                className: 'px-3 py-2 border rounded-lg text-sm',
                                style: { borderColor: '#D1D5DB' }
                            },
                                h('option', { value: '' }, 'All Months'),
                                availableMonths.map(month =>
                                    h('option', { key: month, value: month },
                                        new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                                    )
                                )
                            )
                        ),
                        h('div', { className: 'text-sm text-gray-600' },
                            'Current Base Rate: ',
                            h('span', { className: 'font-bold text-blue-600' }, `${currentBaseRate} Ft/hour`)
                        )
                    )
                ),
                h('div', { className: 'overflow' },
                    h('table', {},
                        h('thead', {},
                            h('tr', {},
                                h('th', {}, 'Date'), h('th', {}, 'Start'), h('th', {}, 'End'),
                                h('th', {}, 'Break 1'), h('th', {}, 'Break 2'), h('th', {}, 'Hours'),
                                h('th', {}, 'Base Rate'), h('th', {}, 'Type'),
                                h('th', { className: 'right' }, 'Earnings'),
                                h('th', { className: 'center' }, 'Actions')
                            )
                        ),
                        h('tbody', {},
                            daysCalc.map(d => h('tr', { key: d.id },
                                h('td', {}, d.date), h('td', {}, d.startTime), h('td', {}, d.endTime),
                                h('td', { className: 'text-xs' },
                                    d.break1Start && d.break1End ? `${d.break1Start}-${d.break1End}` : '-'),
                                h('td', { className: 'text-xs' },
                                    d.break2Start && d.break2End ? `${d.break2Start}-${d.break2End}` : '-'),
                                h('td', {}, `${d.workedHours.toFixed(2)}h`),
                                h('td', { className: 'font-medium text-gray-700' }, `${d.baseRateUsed} Ft`),
                                h('td', {},
                                    d.isHoliday && h('span', { className: 'badge bg-red-100 text-red-800' }, 'Holiday'),
                                    d.isWeekend && h('span', { className: 'badge bg-blue-100 text-blue-800' }, 'Weekend')
                                ),
                                h('td', { className: 'right font-medium' },
                                    `${Math.round(d.earnings).toLocaleString()} Ft`),
                                h('td', { className: 'center' },
                                    h('div', { style: { display: 'flex', justifyContent: 'center', gap: '0.5rem' } },
                                        h('button', { className: 'btn-edit', onClick: () => editDay(d), title: 'Edit' },
                                            icons.edit()
                                        ),
                                        h('button', { className: 'btn-danger', onClick: () => delDay(d.id), title: 'Delete' },
                                            icons.trash()
                                        )
                                    )
                                )
                            ))
                        )
                    )
                ),
                h('div', { className: 'mt-6 pt-6 border-t' },
                    h('div', { className: 'grid grid-1 md-grid-3' },
                        h('div', { className: 'bg-blue-50 p-4 rounded-lg' },
                            h('p', { className: 'text-sm text-gray-600 mb-1' }, 'Total Hours'),
                            h('p', { className: 'text-2xl font-bold text-gray-800' }, `${totHrs.toFixed(2)}h`)
                        ),
                        h('div', { className: 'bg-green-50 p-4 rounded-lg' },
                            h('p', { className: 'text-sm text-gray-600 mb-1' }, 'Gross Earnings'),
                            h('p', { className: 'text-2xl font-bold text-gray-800' },
                                `${Math.round(totGross).toLocaleString()} Ft`)
                        ),
                        h('div', { className: 'bg-indigo-50 p-4 rounded-lg' },
                            h('p', { className: 'text-sm text-gray-600 mb-1' },
                                `Net Earnings ${!isSchengen ? '(after 15% tax)' : ''}`),
                            h('p', { className: 'text-2xl font-bold text-gray-800' },
                                `${Math.round(totNet).toLocaleString()} Ft`)
                        )
                    )
                )
            )
        )
    );
}

function render() {
    const root = document.getElementById('root');
    const activeElement = document.activeElement;
    const activeId = activeElement ? activeElement.id : null;
    const activeSelectionStart = activeElement && activeElement.selectionStart !== undefined ? activeElement.selectionStart : null;

    root.innerHTML = '';
    root.appendChild(App());

    if (activeId) {
        const newActiveElement = document.getElementById(activeId);
        if (newActiveElement) {
            newActiveElement.focus();
            if (activeSelectionStart !== null && typeof newActiveElement.setSelectionRange === 'function') {
                newActiveElement.setSelectionRange(activeSelectionStart, activeSelectionStart);
            }
        }
    }
}

render();
