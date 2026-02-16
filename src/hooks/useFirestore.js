import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const useFirestore = (key, initialValue) => {
    const { user } = useAuth();
    const [storedValue, setStoredValue] = useState(initialValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setStoredValue(initialValue);
            setLoading(false);
            return;
        }

        const docRef = doc(db, 'users', user.uid, 'data', key);

        // Initial fetch
        const fetchData = async () => {
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setStoredValue(docSnap.data().value);
                } else {
                    // Initialize with initialValue if it doesn't exist
                    await setDoc(docRef, { value: initialValue });
                    setStoredValue(initialValue);
                }
            } catch (error) {
                console.error(`Error reading Firestore key “${key}”:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Real-time listener
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setStoredValue(docSnap.data().value);
            }
        });

        return () => unsubscribe();
    }, [user, key, initialValue]);

    const setValue = async (value) => {
        if (!user) return;

        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            const docRef = doc(db, 'users', user.uid, 'data', key);
            await setDoc(docRef, { value: valueToStore });
            setStoredValue(valueToStore);
        } catch (error) {
            console.error(`Error setting Firestore key “${key}”:`, error);
        }
    };

    return [storedValue, setValue, loading];
};

export default useFirestore;
