'use client'

import { useEffect, useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UserPlus, Search, Edit, Trash } from 'lucide-react'
import { DBDoctor } from '@/types/db'

export default function DoctorsPage() {
    const { addDoctor, updateDoctor, deleteDoctor } = useAppContext()
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDoctor, setSelectedDoctor] = useState<typeof doctors[0] | null>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [doctors, setDoctors] = useState<DBDoctor[]>([])

    useEffect(() => {
        const loadDoctors = async () => {
            const doctorsRes = await fetch('/api/doctors');
            const doctorsData = await doctorsRes.json();
            setDoctors(doctorsData)
        }
        loadDoctors()
    }, [])

    if (user?.role !== 'admin') {
        return <div>You do not have permission to view this page.</div>
    }

    // const filteredDoctors = doctors.filter(
    //     doctor => {
    //         console.log(doctor)
    //         const doctorName = doctor.name;
    //         return doctor
    //     }
    // )

    const filteredDoctors = doctors.filter(
        doctor => {
            if (!doctors) return []
            return doctors.filter(doctor =>
                doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })

    const handleAddDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        await addDoctor({
            name: formData.get('name') as string,
            email: '',
            phone: '',
            is_active: false
        })
        setIsAddDialogOpen(false)
    }

    const handleUpdateDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedDoctor) return
        const formData = new FormData(e.currentTarget)
        const updatedName = formData.get('name') as string
    
        try {
            await updateDoctor(selectedDoctor.id, {
                name: updatedName,
            })
            
            // Update the doctors state with the new data
            setDoctors(prevDoctors => prevDoctors.map(doctor => 
                doctor.id === selectedDoctor.id 
                    ? { ...doctor, name: updatedName }
                    : doctor
            ))
    
            setIsEditDialogOpen(false)
            setSelectedDoctor(null)
        } catch (error) {
            console.error('Failed to update doctor:', error)
            // Optionally add error handling UI feedback here
        }
    }
    

    const handleDeleteDoctor = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this doctor?')) {
            await deleteDoctor(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Doctors</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Add Doctor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Doctor</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddDoctor}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input id="name" name="name" placeholder="Doctor's Name" required className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Doctor</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center space-x-2">
                <Input
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                            <TableCell>{doctor.name}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="icon" onClick={() => {
                                        setSelectedDoctor(doctor)
                                        setIsEditDialogOpen(true)
                                    }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleDeleteDoctor(doctor.id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Doctor</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateDoctor}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    defaultValue={selectedDoctor?.name}
                                    required
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update Doctor</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

