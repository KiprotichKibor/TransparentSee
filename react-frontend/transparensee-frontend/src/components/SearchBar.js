import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SearchBar = ({ onSearch, type }) => {
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [status, setStatus] = useState('');
    const [region, setRegion] = useState('');

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
                        <option value='pending'>Pending</option>
                        <option value='in_progress'>In Progress</option>
                        <option value='resolved'>Resolved</option>
                    </select>
                </div>
                <div className='col-md-2'>
                    <select
                        className='form-control'
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                    >
                        <option value=''>Select Region</option>
                        <option value='1'>Region 1</option>
                        <option value='2'>Region 2</option>
                        <option value='3'>Region 3</option>
                    </select>
                </div>
            </div>
            <button className='btn btn-primary mt-2' type='submit'>Search</button>
        </form>
    );                  
};

export default SearchBar;