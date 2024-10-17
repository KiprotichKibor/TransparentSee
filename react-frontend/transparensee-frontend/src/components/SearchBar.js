import React, { useState } from 'react';

const SearchBar = ({ onSearch, placeholder }) => {
    const [search, setSearch] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(search);
    };

    return (
        <form onSubmit={handleSubmit} className='mb-3'>
            <div className='input-group'>
                <input
                    type='text'
                    className='form-control'
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className='btn btn-outline-secondary' type='submit'>Search</button>
            </div>
        </form>
    );
};

export default SearchBar;