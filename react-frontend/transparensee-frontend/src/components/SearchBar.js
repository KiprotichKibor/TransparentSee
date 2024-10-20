import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getRegions } from '../services/api';

const SearchBar = ({ onSearch, type }) => {
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [status, setStatus] = useState('');
    const [region, setRegion] = useState('');
    const [regions, setRegions] = useState([]);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await getRegions();
                setRegions(response.data);
            } catch (error) {
                console.error('Failed to fetch regions:', error);
            }
        };
        fetchRegions();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({
            search,
            start_date: startDate,
            end_date: endDate,
            status,
            region,
        });
    };

    const getStatusOptions = () => {
        if (type === 'report') {
            return [
                { value: 'pending', label: 'Pending' },
                { value: 'under_investigation', label: 'Under Investigation' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'dismissed', label: 'Dismissed' },
            ];
        } else if (type === 'investigation') {
            return [
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'closed', label: 'Closed' },
            ];
        }
        return [];
    };

    return (
        <form onSubmit={handleSubmit} className='mb-3'>
            <div className='row g-3'>
                <div className='col-md-4'>
                    <input
                        type='text'
                        className='form-control'
                        placeholder={`Search ${type}s...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className='col-md-2'>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        placeholderText='Start Date'
                        className='form-control'
                    />
                </div>
                <div className='col-md-2'>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        placeholderText='End Date'
                        className='form-control'
                    />
                </div>
                <div className='col-md-2'>
                    <select
                        className='form-control'
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value=''>Select Status</option>
                        {getStatusOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='col-md-2'>
                    <select
                        className='form-control'
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                    >
                        <option value=''>Select Region</option>
                        {regions.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <button className='btn btn-primary mt-2' type='submit'>Search</button>
        </form>
    );                  
};

export default SearchBar;